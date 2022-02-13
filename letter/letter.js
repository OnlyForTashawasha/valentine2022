
const main = async () => {
  // Fetch letter
  const r = await fetch('./letter.json');
  const letter = (await r.json()).letter;
  
  // Stores current index
  let index = 0;
  
  // Render dialogue
  const render = () => {
    const data = letter[index];
    const img = document.getElementById('char');
    img.src = `../assets/ash/${data.face}.png`;
    
    const dialogue = document.getElementById('dialogue');
    dialogue.innerText = data.text;
    
    // Shows the words one at a time
    const speakText = async () => {
      // Split text into words
      const words = data.text.split(" ");
      const wordTime = 0.05;
      let totalStr = null;
      for (const w of words) {
        // Update total string
        totalStr = totalStr === null ? w : totalStr + ` ${w}`;
        dialogue.innerText = totalStr;
        await new Promise((r, _) => setTimeout(r, wordTime * 1000));
      }
    }
    speakText();
  }
  render();
  
  let audio = null;
  // Attach listeners
  document.getElementById('dialogue').addEventListener('click', () => {
    // Increment index
    index = Math.min(index + 1, letter.length - 1);
    render();
    
    // Play audio if not playing
    if (audio === null) {
      audio = new Audio('../assets/sound/some.mp3');
      audio.loop = true;
      audio.play();
    }
  })
}
main();
