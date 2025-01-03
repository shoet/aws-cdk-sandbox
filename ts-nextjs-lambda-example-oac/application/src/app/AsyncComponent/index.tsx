export const AsyncComponent = async () => {
  await fetch("https://api.blog.shoet.team/blogs", { cache: "no-store" });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <div>Complete!</div>;
};
