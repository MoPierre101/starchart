// The rating shown with every issue and story.

export type Rating = "all ages" | "comics code" | "teen" | "mature" | "other" | "unknown";

// Returns the rating to show, or unknown when the item has no rating class.
export function ratingLabel(ratingClass: string | null): Rating {
  if (ratingClass === null || ratingClass === "none") return "unknown";
  return ratingClass as Rating;
}
