import FlyLeavingBox from "./assets/flyLeavesEmptyBox.png";

export function imageResolver(image: "FlyLeavingBox") {
  const mapper = {
    FlyLeavingBox,
  };

  return mapper[image];
}
