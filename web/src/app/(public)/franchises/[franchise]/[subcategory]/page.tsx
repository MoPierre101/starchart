export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ franchise: string; subcategory: string }>
}) {
  const { franchise, subcategory } = await params
  return null
}
