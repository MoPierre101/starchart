export default async function FranchisePage({
  params,
}: {
  params: Promise<{ franchise: string }>
}) {
  const { franchise } = await params
  return null
}
