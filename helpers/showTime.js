export default function showTime(type, mill) {
  if (type === "sec") {
    let secValue = 0;
    secValue = parseInt((mill / 1000) % 60);
    return secValue.toString().length < 2 ? "0" + "" + secValue : secValue;
  }
  if (type === "min") {
    let minValue;
    minValue = parseInt(mill / 60000);
    return minValue.toString().length < 2 ? "0" + "" + minValue : minValue;
  }
}
