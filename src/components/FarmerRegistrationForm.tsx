import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import formHtml from "@/data/farmer-registration.html?raw";
import { saveFarmerRegistration } from "@/lib/farmer-registration.functions";

const storageBridge = `<script>
(() => {
  const origin = parent.location.origin;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (url, options) => {
    if (url !== 'https://formspree.io/f/mgaoovoy') return originalFetch(url, options);
    const data = Object.fromEntries(options.body.entries());
    await new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const timer = setTimeout(() => { window.removeEventListener('message', receive); reject(new Error('Storage timeout')); }, 30000);
      function receive(event) {
        if (event.source !== parent || event.origin !== origin || event.data?.id !== id) return;
        clearTimeout(timer); window.removeEventListener('message', receive);
        event.data.ok ? resolve() : reject(new Error('Storage failed'));
      }
      window.addEventListener('message', receive);
      parent.postMessage({ type: 'farmer-registration', id, data }, origin);
    });
    let response;
    try { response = await originalFetch(url, options); } catch { response = null; }
    if (!response || !response.ok) response = new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    if (response.ok) setTimeout(() => parent.postMessage({ type: 'farmer-registration-complete' }, origin), 0);
    return response;
  };
})();
</script>`;
const repeatScript = `<script>
document.getElementById('form-section').classList.remove('hidden');
document.getElementById('welcome-section').classList.add('hidden');
</script>`;

export function FarmerRegistrationForm({ repeat = false, onComplete }: { repeat?: boolean; onComplete: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const save = useServerFn(saveFarmerRegistration);
  useEffect(() => {
    let pending = false;
    let lastSubmission = 0;
    const receive = async (event: MessageEvent) => {
      const target = frame.current?.contentWindow;
      if (!target || event.source !== target || event.origin !== window.location.origin || !['farmer-registration', 'farmer-registration-complete'].includes(event.data?.type)) return;
      if (event.data.type === 'farmer-registration-complete') {
        if (localStorage.getItem('farmerMobile') && localStorage.getItem('farmerName')) onComplete();
        return;
      }
      const { id, data } = event.data;
      if (typeof id !== 'string') return;
      if (pending || Date.now() - lastSubmission < 5000) {
        target.postMessage({ id, ok: true }, window.location.origin);
        return;
      }
      pending = true;
      try {
        await save({ data });
        lastSubmission = Date.now();
        target.postMessage({ id, ok: true }, window.location.origin);
      } catch {
        target.postMessage({ id, ok: false }, window.location.origin);
      } finally { pending = false; }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [save, onComplete]);
  return <main className="min-h-screen bg-background">
    {repeat && <div className="px-4 py-3"><Button variant="outline" asChild><Link to="/">← Back to all tools</Link></Button></div>}
    <iframe ref={frame} title="Farmer Registration" srcDoc={`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Farmer Registration</title></head><body>${storageBridge}${formHtml}${repeat ? repeatScript : ""}</body></html>`} className="min-h-[800px] w-full border-0" />
  </main>;
}