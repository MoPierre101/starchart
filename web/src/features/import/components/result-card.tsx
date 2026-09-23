"use client";

import { useState } from "react";
import { ArrowDownToLine, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { gooeyToast } from "@/components/ui/goey-toaster";

import type { MediaSearchResult } from "../search.schema";

const MEDIA_TYPE_LABELS: Record<string, string> = {
  film: "FILM",
  movie: "FILM",
  series: "SERIES",
  tv: "SERIES",
  run: "RUN",
  tpb: "TPB",
};

function mediaTypeLabel(mediaType: string) {
  return MEDIA_TYPE_LABELS[mediaType.toLowerCase()] ?? mediaType.toUpperCase();
}

// Diagonal hatch standing in for a missing poster.
const POSTER_PLACEHOLDER_STYLE = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 8px, transparent 8px 20px)",
};

type ResultCardProps = {
  result: MediaSearchResult;
};

export function ResultCard({ result }: ResultCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  function handleImport() {
    // TODO: wire to the backend import endpoint once it exists.
    setIsAdded(true);
    gooeyToast.success(`${result.title} added to the library`);
  }

  return (
    <Card className="relative aspect-2/3 justify-end gap-0 overflow-hidden bg-neutral-900 p-0 py-0 text-neutral-50 ring-0">
      {result.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster hosts are provider-controlled and not in next.config images.
        <img
          src={result.poster_url}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-start justify-center pt-16 text-xs text-neutral-500"
          style={POSTER_PLACEHOLDER_STYLE}
        >
          poster
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 top-1/3 bg-linear-to-t from-neutral-950 via-neutral-950/85 to-transparent" />

      <div className="relative flex flex-col items-start gap-2 p-4">
        <Badge className="bg-white/10 text-[0.625rem] tracking-wide text-neutral-100">
          {mediaTypeLabel(result.media_type)}
        </Badge>

        <p className="font-heading text-base leading-snug font-semibold text-balance">
          {result.title}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {result.release_year !== null ? (
            <Badge className="bg-white/10 text-neutral-200">
              {result.release_year}
            </Badge>
          ) : null}
          <Badge className="bg-white/10 text-neutral-200 capitalize">
            {result.provider}
          </Badge>
        </div>

        <Button
          size="lg"
          onClick={handleImport}
          disabled={isAdded}
          aria-label={
            isAdded ? `${result.title} added` : `Import ${result.title}`
          }
          className={
            isAdded
              ? "mt-1 w-full rounded-full border-neutral-600 bg-transparent text-neutral-200 disabled:opacity-100"
              : "mt-1 w-full rounded-full bg-white text-neutral-900 hover:bg-neutral-200"
          }
        >
          {isAdded ? (
            <>
              <Check /> Added
            </>
          ) : (
            <>
              <ArrowDownToLine /> Import
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
