# AIBlaze — Backup & Restore Guide

This guide covers backing up and restoring three things: **code**, **database**, and **uploaded assets**.

---

## 1. Code backup — GitHub

AIBlaze uses Lovable's two-way GitHub sync. Every edit in Lovable pushes to GitHub automatically, and every push to GitHub syncs back to Lovable.

### Connect once
1. In the Lovable editor, click the **+** menu in the chat input → **GitHub** → **Connect project**.
2. Authorize the Lovable GitHub App on GitHub.
3. Pick the account/organization where the repo will live.
4. Click **Create Repository** — Lovable generates the repo with the current code.

### Day-to-day
- Edits in Lovable are auto-committed and pushed.
- You can clone locally: `git clone <repo-url>` and edit, then `git push` — changes sync back to Lovable in seconds.
- Branches: create a feature branch on GitHub, work on it, open a PR. Once merged to `main`, Lovable picks it up.

### Restore code to a previous state
- **Inside Lovable**: use the version history (top bar → Versions) to roll back any change.
- **From GitHub**: `git revert <commit>` or `git checkout <commit> -- <file>` then push — Lovable syncs the rollback.

---

## 2. Database backup — Supabase

### Automatic (built-in)
Supabase keeps automated daily backups of the entire database. To restore from these:
1. In Lovable: **Connectors → Lovable Cloud → Manage**.
2. From there, request a point-in-time restore (contact support if no self-serve UI is exposed).

### Manual export (anytime)
For human-readable backups you control:
1. Open **Lovable Cloud → Database → Tables**.
2. For each table (`categories`, `subcategories`, `tools`, `prompts`, `blog_posts`, `learn_tasks`, `bug_reports`, `user_roles`, etc.), click the table, then **Export → CSV**.
3. Save the CSV files somewhere durable (Google Drive, Dropbox, S3).

### Recommended schedule
- **Weekly**: export all tables via the Cloud UI and store the CSVs in cloud storage.
- **Before any large migration or seed**: full manual export.
- **Before publish**: full manual export.

---

## 3. Uploaded assets — Storage

AIBlaze uses the `content-images` Supabase storage bucket for tool logos, blog covers, prompt sample images, and learn-task covers.

- Supabase storage is **replicated** and durable by default — files won't disappear on their own.
- The bucket is **public**, meaning the files are reachable via a stable HTTPS URL.
- The DB rows that reference these files (`logo_url`, `cover_url`, etc.) are themselves backed up by the database backups above. So restoring the DB and keeping the bucket intact is enough to fully recover.

### To download the entire bucket manually
1. Open **Lovable Cloud → Storage → content-images**.
2. Use the UI's bulk download or the Supabase CLI:
   ```bash
   supabase storage download --recursive content-images ./assets-backup
   ```

---

## 4. Restore process

### Code only
- Use Lovable Versions (top bar) for the fastest rollback.
- Or `git revert` / `git checkout` on GitHub — sync happens automatically.

### Database only
1. Re-import CSVs from your last manual export via **Lovable Cloud → Database → Tables → Import**.
2. Or open a support request for point-in-time restore.

### Full disaster recovery
1. Re-create the project in Lovable from the GitHub repo (Lovable supports importing existing repos as new projects — talk to support).
2. Restore the DB from your latest export (or point-in-time).
3. Storage bucket is still there because it's separately durable.
4. Verify by visiting `/admin` and confirming counts.

---

## 5. What to do today (launch day checklist)

- [ ] Connect GitHub (one-time, 2 minutes).
- [ ] Export every table to CSV via Cloud → Database → Tables → Export.
- [ ] Save the CSV bundle to Google Drive or similar.
- [ ] Bookmark this file.

That's it. You now have code in GitHub, data in two places (Supabase + your offline CSV bundle), and assets in durable storage.

---

## Contact
For backup or restore help, email **aiblaze.io@gmail.com**.
