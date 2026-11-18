<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
 
- Keep supplied Farmer Registration HTML unchanged in an isolated iframe; a separate message bridge stores submissions before its requested Formspree delivery so original styles and script remain intact.
- Farmer registrations use a validated public server function and an anonymous insert-only policy; visitors cannot read, update or delete contact details.
- Use the shared registration iframe on the home page until browser registration is completed; the separate registration route allows repeat submissions without clearing saved details. This is an onboarding preference, not authentication.
- Keep branded tool-button motion in the shared Button tool variant and global CSS with reduced-motion overrides, so all six tools stay consistent without changing their workflows.
