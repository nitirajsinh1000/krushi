import { useState } from "react";
import { Camera } from "./icons";

function stripSci(name: string) {
  return (name || "").replace(/\([^)]*\)/g, "").trim();
}

export function imgSearchUrl(cropName: string, pestName: string) {
  const q = encodeURIComponent(
    `${cropName} ${stripSci(pestName)} crop damage identification photo`,
  );
  return `https://www.google.com/search?tbm=isch&q=${q}`;
}

async function fetchPestThumbnail(pestName: string): Promise<string | null> {
  const query = encodeURIComponent(stripSci(pestName) + " pest crop");
  const url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${query}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=320&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as { thumbnail?: { source?: string } };
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

export function PestPhoto({
  cropName,
  pestName,
}: {
  cropName: string;
  pestName: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "found">("idle");
  const [thumb, setThumb] = useState<string | null>(null);

  const handleClick = async () => {
    if (status === "loading") return;
    if (status === "found") {
      setStatus("idle");
      setThumb(null);
      return;
    }
    setStatus("loading");
    const url = await fetchPestThumbnail(pestName);
    if (url) {
      setThumb(url);
      setStatus("found");
    } else {
      setStatus("idle");
      window.open(imgSearchUrl(cropName, pestName), "_blank", "noopener");
    }
  };

  const found = status === "found";

  return (
    <div className="mt-1 flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
          found
            ? "border-forest bg-mint text-forest"
            : "border-line bg-paper text-clay"
        }`}
      >
        {status === "loading" ? (
          <span>Loading photo…</span>
        ) : (
          <>
            <Camera size={13} />
            <span>{found ? "Hide photo" : "Show pest photo"}</span>
          </>
        )}
      </button>
      {found && thumb && (
        <div className="flex flex-col gap-1">
          <img
            src={thumb}
            alt={`${stripSci(pestName)} on ${cropName}`}
            loading="lazy"
            className="h-32 w-32 rounded-lg border border-line object-cover"
            onError={() => {
              setStatus("idle");
              setThumb(null);
            }}
          />
          <a
            href={imgSearchUrl(cropName, pestName)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-link underline"
          >
            More photos &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
