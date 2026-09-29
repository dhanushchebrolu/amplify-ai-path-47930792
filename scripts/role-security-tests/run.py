#!/usr/bin/env python3
"""Role/authorization regression tests for the Supabase migrations.

Runs every migration from the 20260722 baseline onward against a throwaway
local PostgreSQL that mimics Supabase (anon/authenticated/service_role roles,
auth.users, auth.uid(), and Supabase's default public-schema privileges), then
exercises role management as different callers.

Usage:
  PGHOST=/var/run/postgresql PGPORT=5432 PGUSER=postgres \
    python3 scripts/role-security-tests/run.py [--skip-migration FILE]

--skip-migration lets you run the suite against the schema *without* a given
migration (e.g. to show which checks fail before the hardening migration).
Exit code is non-zero if any check fails.
"""
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MIGRATIONS = HERE.parent.parent / "supabase" / "migrations"
BASELINE = "20260722"

SUPER = "00000000-0000-0000-0000-000000000001"
ADMIN = "00000000-0000-0000-0000-000000000002"
USER = "00000000-0000-0000-0000-000000000003"
TARGET = "00000000-0000-0000-0000-000000000004"
UNCONF = "00000000-0000-0000-0000-000000000005"
INVITEE = "00000000-0000-0000-0000-000000000006"
LEGACY = "00000000-0000-0000-0000-000000000007"
EDITOR_TOKEN = "11111111-1111-1111-1111-111111111111"
UNCONF_TOKEN = "22222222-2222-2222-2222-222222222222"


def psql(db, sql, check=True):
    cmd = ["psql", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-d", db, "-c", sql]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(f"{db}: {r.stderr.strip()}\n--- SQL ---\n{sql}")
    return r


def psql_file(db, path):
    r = subprocess.run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", db, "-f", str(path)],
                       capture_output=True, text=True)
    return r


def seed_sql(with_super: bool) -> str:
    roles = [f"('{ADMIN}','admin')", f"('{SUPER}','admin')"]
    if with_super:
        roles.append(f"('{SUPER}','super_admin')")
    return f"""
INSERT INTO auth.users (id, email, email_confirmed_at) VALUES
  ('{SUPER}',  'super@x.test',    now()),
  ('{ADMIN}',  'admin@x.test',    now()),
  ('{USER}',   'user@x.test',     now()),
  ('{TARGET}', 'target@x.test',   now()),
  ('{UNCONF}', 'invitee@x.test',  NULL),
  ('{INVITEE}','invitee2@x.test', now()),
  ('{LEGACY}', 'legacy@x.test',   now());
INSERT INTO public.user_roles (user_id, role) VALUES {", ".join(roles)};
-- pending invitations created by the super admin
INSERT INTO public.admin_invitations (email, invited_by, role, token) VALUES
  ('invitee@x.test',  '{SUPER}', 'admin',  '{UNCONF_TOKEN}'),
  ('invitee2@x.test', '{SUPER}', 'editor', '{EDITOR_TOKEN}');
-- a legacy super_admin invitation written by a plain admin (possible before hardening)
INSERT INTO public.admin_invitations (email, invited_by, role) VALUES ('legacy@x.test', '{ADMIN}', 'super_admin');
"""


def as_caller(who: str, sql: str) -> str:
    """Wrap SQL so it runs the way PostgREST would run it for this caller."""
    if who == "anon":
        prefix = "SET ROLE anon;"
    elif who == "service":
        prefix = "SET ROLE service_role;"
    else:
        prefix = f"SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '{who}', false);"
    return f"{prefix} {sql}"


# (name, scenario, caller, action SQL, post-condition SQL that must be true, expect)
# expect: "blocked" -> the post-condition describes "nothing changed";
#         "allowed" -> the action must succeed AND the post-condition must hold.
NO_SUPER = f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='super_admin' AND user_id <> '{SUPER}')"
TESTS = [
    # --- unauthenticated -------------------------------------------------------
    ("anon: INSERT super_admin into user_roles", "normal", "anon",
     f"INSERT INTO public.user_roles (user_id, role) VALUES ('{USER}','super_admin')",
     NO_SUPER, "blocked"),
    ("anon: DELETE all user_roles", "normal", "anon",
     "DELETE FROM public.user_roles",
     "(SELECT count(*) FROM public.user_roles) = 3", "blocked"),
    ("anon: INSERT admin invitation", "normal", "anon",
     f"INSERT INTO public.admin_invitations (email, invited_by, role) VALUES ('evil@x.test','{SUPER}','super_admin')",
     "NOT EXISTS (SELECT 1 FROM public.admin_invitations WHERE email='evil@x.test')", "blocked"),
    ("anon: call assign_role", "normal", "anon",
     "SELECT public.assign_role('target@x.test','admin')",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{TARGET}')", "blocked"),
    ("anon: call sync_my_account", "normal", "anon",
     "SELECT * FROM public.sync_my_account()",
     "NOT EXISTS (SELECT 1 FROM public.admin_invitations WHERE status='accepted')", "blocked"),

    # --- ordinary authenticated user ------------------------------------------
    ("user: INSERT self as admin", "normal", USER,
     f"INSERT INTO public.user_roles (user_id, role) VALUES ('{USER}','admin')",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{USER}')", "blocked"),
    ("user: UPDATE another user's role row", "normal", USER,
     "UPDATE public.user_roles SET status='suspended'",
     "NOT EXISTS (SELECT 1 FROM public.user_roles WHERE status='suspended')", "blocked"),
    ("user: DELETE role rows", "normal", USER,
     "DELETE FROM public.user_roles",
     "(SELECT count(*) FROM public.user_roles) = 3", "blocked"),
    ("user: INSERT invitation for own email then sync", "normal", USER,
     f"INSERT INTO public.admin_invitations (email, invited_by, role) VALUES ('user@x.test','{USER}','admin'); SELECT * FROM public.sync_my_account()",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{USER}')", "blocked"),
    ("user: assign_role(self, admin)", "normal", USER,
     "SELECT public.assign_role('user@x.test','admin')",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{USER}')", "blocked"),
    ("user: can still read own roles (none)", "normal", USER,
     "SELECT count(*) FROM public.user_roles",
     "true", "allowed"),

    # --- admin self-promotion ---------------------------------------------------
    ("admin: INSERT self as super_admin", "normal", ADMIN,
     f"INSERT INTO public.user_roles (user_id, role) VALUES ('{ADMIN}','super_admin')",
     NO_SUPER, "blocked"),
    ("admin: UPDATE own admin row to super_admin", "normal", ADMIN,
     f"UPDATE public.user_roles SET role='super_admin' WHERE user_id='{ADMIN}'",
     NO_SUPER, "blocked"),
    ("admin: assign_role(self, super_admin)", "normal", ADMIN,
     "SELECT public.assign_role('admin@x.test','super_admin')",
     NO_SUPER, "blocked"),
    ("admin: assign_role(self, super_admin) with no super admin (bootstrap state)", "bootstrap", ADMIN,
     "SELECT public.assign_role('admin@x.test','super_admin')",
     "NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='super_admin')", "blocked"),
    ("admin: INSERT super_admin invitation for self then sync", "normal", ADMIN,
     f"INSERT INTO public.admin_invitations (email, invited_by, role) VALUES ('admin@x.test','{ADMIN}','super_admin'); SELECT * FROM public.sync_my_account()",
     NO_SUPER, "blocked"),
    ("admin: UPDATE a pending invitation to super_admin for self", "normal", ADMIN,
     "UPDATE public.admin_invitations SET role='super_admin', email='admin@x.test' WHERE email='invitee2@x.test'; SELECT * FROM public.sync_my_account()",
     NO_SUPER, "blocked"),
    ("admin: bootstrap_super_admin RPC not callable", "bootstrap", ADMIN,
     "SELECT public.bootstrap_super_admin('admin@x.test')",
     "NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='super_admin')", "blocked"),

    # --- admin promoting another account ---------------------------------------
    ("admin: assign_role(other, super_admin)", "normal", ADMIN,
     "SELECT public.assign_role('target@x.test','super_admin')",
     NO_SUPER, "blocked"),
    ("admin: assign_role(other, super_admin) in bootstrap state", "bootstrap", ADMIN,
     "SELECT public.assign_role('target@x.test','super_admin')",
     "NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='super_admin')", "blocked"),
    ("admin: assign_role(new email, super_admin) invitation in bootstrap state", "bootstrap", ADMIN,
     "SELECT public.assign_role('newperson@x.test','super_admin')",
     "NOT EXISTS (SELECT 1 FROM public.admin_invitations WHERE email='newperson@x.test')", "blocked"),
    ("admin: INSERT super_admin row for other", "normal", ADMIN,
     f"INSERT INTO public.user_roles (user_id, role) VALUES ('{TARGET}','super_admin')",
     NO_SUPER, "blocked"),
    ("admin: remove the super admin's role", "normal", ADMIN,
     f"DELETE FROM public.user_roles WHERE user_id='{SUPER}'",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{SUPER}' AND role='super_admin')", "blocked"),
    ("legacy super_admin invitation from a non-super admin is not honoured", "normal", LEGACY,
     "SELECT * FROM public.sync_my_account()",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{LEGACY}')", "blocked"),

    # --- legitimate role management still works --------------------------------
    ("super: assign_role(existing user, admin)", "normal", SUPER,
     "SELECT public.assign_role('target@x.test','admin')",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{TARGET}' AND role='admin')", "allowed"),
    ("super: assign_role(existing user, super_admin)", "normal", SUPER,
     "SELECT public.assign_role('target@x.test','super_admin')",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{TARGET}' AND role='super_admin')", "allowed"),
    ("super: assign_role(new email, editor) creates invitation", "normal", SUPER,
     "SELECT public.assign_role('newperson@x.test','editor')",
     "EXISTS (SELECT 1 FROM public.admin_invitations WHERE email='newperson@x.test' AND role='editor' AND status='pending')", "allowed"),
    ("super: set_role_status suspend admin", "normal", SUPER,
     f"SELECT public.set_role_status('{ADMIN}','admin','suspended')",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{ADMIN}' AND status='suspended')", "allowed"),
    ("super: remove_role admin", "normal", SUPER,
     f"SELECT public.remove_role('{ADMIN}','admin')",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{ADMIN}')", "allowed"),
    ("admin: list_admin_users / list_role_invitations / list_admins still work", "normal", ADMIN,
     "SELECT (SELECT count(*) FROM public.list_admin_users()) + (SELECT count(*) FROM public.list_role_invitations()) + (SELECT count(*) FROM public.list_admins())",
     "true", "allowed"),
    ("admin: can read invitations and audit log tables", "normal", ADMIN,
     "SELECT (SELECT count(*) FROM public.admin_invitations) + (SELECT count(*) FROM public.admin_audit_log)",
     "true", "allowed"),
    ("admin: invite_admin still creates an admin invitation", "normal", ADMIN,
     "SELECT public.invite_admin('newadmin@x.test')",
     "EXISTS (SELECT 1 FROM public.admin_invitations WHERE email='newadmin@x.test' AND role='admin')", "allowed"),
    ("bootstrap state: admin can still assign non-super roles", "bootstrap", ADMIN,
     "SELECT public.assign_role('target@x.test','editor')",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{TARGET}' AND role='editor')", "allowed"),
    ("bootstrap: service_role can create the first super admin", "bootstrap", "service",
     "SELECT public.bootstrap_super_admin('super@x.test')",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{SUPER}' AND role='super_admin')", "allowed"),
    ("bootstrap: refused once a super admin exists", "normal", "service",
     "SELECT public.bootstrap_super_admin('target@x.test')",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{TARGET}')", "blocked"),
    ("confirmed invitee: sync_my_account grants the invited role", "normal", INVITEE,
     "SELECT * FROM public.sync_my_account()",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{INVITEE}' AND role='editor') AND EXISTS (SELECT 1 FROM public.admin_invitations WHERE email='invitee2@x.test' AND status='accepted')", "allowed"),
    ("confirmed invitee: token acceptance grants the invited role (editor, not admin)", "normal", INVITEE,
     f"SELECT public.accept_admin_invitation('{EDITOR_TOKEN}')",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{INVITEE}' AND role='editor') AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{INVITEE}' AND role='admin')", "allowed"),

    # --- unconfirmed email ------------------------------------------------------
    ("unconfirmed invitee: sync_my_account does not grant role", "normal", UNCONF,
     "SELECT * FROM public.sync_my_account()",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{UNCONF}') AND EXISTS (SELECT 1 FROM public.admin_invitations WHERE email='invitee@x.test' AND status='pending')", "blocked"),
    ("unconfirmed invitee: token acceptance does not grant role", "normal", UNCONF,
     f"SELECT public.accept_admin_invitation('{UNCONF_TOKEN}')",
     f"NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{UNCONF}')", "blocked"),
    ("unconfirmed invitee: role is granted after the email is confirmed", "normal", UNCONF,
     f"RESET ROLE; UPDATE auth.users SET email_confirmed_at = now() WHERE id='{UNCONF}'; "
     f"SET ROLE authenticated; SELECT * FROM public.sync_my_account()",
     f"EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='{UNCONF}' AND role='admin')", "allowed"),
]


def main():
    skip = None
    if "--skip-migration" in sys.argv:
        skip = sys.argv[sys.argv.index("--skip-migration") + 1]
    admin_db = "postgres"

    templates = {}
    for scenario, with_super in (("normal", True), ("bootstrap", False)):
        db = f"roletest_tpl_{scenario}"
        psql(admin_db, f"DROP DATABASE IF EXISTS {db}")
        psql(admin_db, f"CREATE DATABASE {db}")
        r = psql_file(db, HERE / "supabase_scaffold.sql")
        if r.returncode != 0:
            sys.exit(f"scaffold failed: {r.stderr}")
        for f in sorted(MIGRATIONS.glob("*.sql")):
            if f.name < BASELINE or (skip and skip in f.name):
                continue
            r = psql_file(db, f)
            # 20260812053625 re-creates tool_comparison_data non-idempotently; it is unrelated to roles.
            if r.returncode != 0 and "tool_comparison_data" not in r.stderr:
                sys.exit(f"migration {f.name} failed: {r.stderr}")
        psql(db, seed_sql(with_super))
        templates[scenario] = db

    failures = 0
    for name, scenario, who, action, post, expect in TESTS:
        db = "roletest_case"
        psql(admin_db, f"DROP DATABASE IF EXISTS {db}")
        psql(admin_db, f"CREATE DATABASE {db} TEMPLATE {templates[scenario]}")
        r = psql(db, as_caller(who, action), check=False)
        action_ok = r.returncode == 0
        holds = psql(db, f"SELECT ({post})").stdout.strip() == "t"
        passed = holds and (action_ok if expect == "allowed" else True)
        failures += not passed
        detail = "ok" if action_ok else (r.stderr.strip().splitlines() or ["error"])[-1].replace("psql:", "").strip()
        print(f"{'PASS' if passed else 'FAIL'}  [{expect:7}] {name}  -> {detail[:110]}")
    psql(admin_db, "DROP DATABASE IF EXISTS roletest_case")
    for db in templates.values():
        psql(admin_db, f"DROP DATABASE IF EXISTS {db}")
    print(f"\n{len(TESTS) - failures}/{len(TESTS)} checks passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
