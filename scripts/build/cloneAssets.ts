import("fs/promises").then(async ({ cp }) => {
  const sourceDir = "./src/image-resolver/assets";
  const targetDir = "./dist/assets";

  try {
    await cp(sourceDir, targetDir, { recursive: true });
    console.log("✨ Successfully cloned assets! ✨");
  } catch (error) {
    console.log(error);
  }
});
