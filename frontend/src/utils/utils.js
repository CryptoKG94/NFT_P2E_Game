
export function prettifySeconds(seconds) {
    if ((seconds !== 0 && !seconds) || seconds < 0) {
        return "";
      }
    
      const d = Math.floor(seconds / (3600 * 24));
      const h = Math.floor((seconds % (3600 * 24)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds - d * 3600 * 24 - h * 3600 - m * 60;
    
      const dDisplay = d > 0 ? d + " day  " : "";
      const hDisplay = h > 0 ? h + " h : " : "";
      const mDisplay = m > 0 ? m + " m : " : "";
      const sDisplay = s >= 0 ? s + " s" : "";
    
      let result = dDisplay + hDisplay + mDisplay + sDisplay;
      // if (mDisplay === "") {
      //   result = result.slice(0, result.length - 2);
      // }
      return result;
  }