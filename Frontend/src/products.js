// Utility function to dynamically import images
const importAssets = async (category, count) => {
  const assets = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      import(`./assets/${category}/${category}${i + 1}.jpg`).then((module) => ({
        id: i + 1,
        image: module.default,
      }))
    )
  );
  return assets;
};

// Data
export const contentData = async () => {
  return {
    women: (await importAssets("Women", 10)).map((asset, index) => ({
      ...asset,
      title: [
        "HEATTECH Collection",
        "Pufftech Parka",
        "Fluffy Yarn Fleece Jacket",
        "UNISEX Versatile T-Shirt",
        "Drapey Wide Flared Jeans",
        "Track Pants",
        "Sweat Wide Pants",
        "Smart Ankle Pants",
        "Linen Skipper Collar Shirt",
        "Washable Knit Ribbed Pants",
      ][index],
      description:
        "Lorem ipsum dolor sit amet consectetur. Urna nisl felis estas orci. Iaculis dolor in tristique aliquet. Proin fringilla urna is piscing ante. Felis mi duis posuere nibh in phasellus cursus eu massa.",
      btnColor: [
        "#FF0000",
        "#9A381B",
        "#009C31",
        "#000000",
        "#A73C3C",
        "#00ADFF",
        "#C95E00",
        "#886240",
        "#FFA600",
        "#B87462",
      ][index],
    })),
    men: (await importAssets("Men", 10)).map((asset, index) => ({
      ...asset,
      title: [
        "Pufftech Praka",
        "Fleece Full-Zip Jacket",
        "Jogger Pants",
        "Crew Neck Sweater",
        "UNISEX Sweatshirt",
        "Jeans Collection",
        "Keith Haring T-Shirt",
        "Oversized T-Shirt",
        "New Arrival Items",
        "Pleated Wide Pants",
      ][index],
      description:
        "Lorem ipsum dolor sit amet consectetur. Urna nisl felis estas orci. Iaculis dolor in tristique aliquet. Proin fringilla urna is piscing ante. Felis mi duis posuere nibh in phasellus cursus eu massa.",
      btnColor: [
        "#C64500",
        "#AE996F",
        "#A84E37",
        "#D7A100",
        "#000000",
        "#4598C6",
        "#D54100",
        "#7B5833",
        "#006BBE",
        "#7F4832",
      ][index],
    })),
    kids: (await importAssets("Kids", 10)).map((asset, index) => ({
      ...asset,
      title: [
        "Warm Long Sleeve T-Shirt",
        "Pufftech Washable Praka",
        "Fleece Full Zip Jacket",
        "Dry Sweat Full Zip Jacket",
        "Crew Neck T-Shirt",
        "Wide Fit Straight Jeans",
        "Bottoms Collection",
        "HEATTECH Collection",
        "AIRism Cotton T-Shirt",
        "GIRLS Flare Sleeve Dress",
      ][index],
      description:
        "Lorem ipsum dolor sit amet consectetur. Urna nisl felis estas orci. Iaculis dolor in tristique aliquet. Proin fringilla urna is piscing ante. Felis mi duis posuere nibh in phasellus cursus eu massa.",
      btnColor: [
        "#070093",
        "#A8876B",
        "#000C4F",
        "#3B3B3B",
        "#A7814D",
        "#4E2A21",
        "#009C31",
        "#000000",
        "#886240",
        "#AE996F",
      ][index],
    })),
    baby: (await importAssets("Baby", 10)).map((asset, index) => ({
      ...asset,
      title: [
        "HEATTECH Thermal T-Shirt",
        "PUFFTECH Washable Parka",
        "Fluffy Yarn Fleece Jacket",
        "Souffle Yarn Cardigan",
        "Crew Neck T-Shirt",
        "Cropped Leggings",
        "MFA Icons Sweatshirt",
        "Cotton Stretch Pants",
        "Soft Fleece Blanket",
        "Soft Knit Beanie",
      ][index],
      description:
        "Lorem ipsum dolor sit amet consectetur. Urna nisl felis estas orci. Iaculis dolor in tristique aliquet. Proin fringilla urna is piscing ante. Felis mi duis posuere nibh in phasellus cursus eu massa.",
      btnColor: [
        "#34150D",
        "#007726",
        "#C64500",
        "#000C4F",
        "#9A381B",
        "#009C31",
        "#D54100",
        "#886240",
        "#AE996F",
        "#FFA600",
      ][index],
    })),
  };
};