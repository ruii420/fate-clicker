let mana = 0;
let manaPerSecond = 0;

const manaDisplay = document.getElementById("mana-count");
const manaPerSecDisplay = document.getElementById("mana-rate");
const clickButton = document.getElementById("click-button");
const upgradesContainer = document.getElementById("upgrades");

function updateDisplay() {
  manaDisplay.textContent = `Mana: ${Math.floor(mana)} MP`;
  manaPerSecDisplay.textContent = `MP/sec: ${manaPerSecond}`;
}

function gainMana(amount) {
  mana += amount;
  updateDisplay();
}

function buyUpgrade(name, cost, value) {
    const noManaText = document.getElementById("no_mana"); 
  
    if (mana >= cost) {
      mana -= cost;
      manaPerSecond += value;
      updateDisplay();
    } else {
      noManaText.innerHTML = "<h2>not enough mana</h2>";
  
      setTimeout(() => {
        noManaText.innerHTML = "";
      }, 2000);
    }
  }

setInterval(() => {
  mana += manaPerSecond;
  updateDisplay();
}, 1000);

clickButton.addEventListener("click", () => {
    gainMana(1);
    clickButton.classList.add("clicked");
    setTimeout(() => {
      clickButton.classList.remove("clicked");
    }, 150);
  });

// Add upgrades dynamically
const upgrades = [
  { name: "Summon Saber", cost: 50, value: 1 },
  { name: "Summon Gilgamesh", cost: 200, value: 5 },
  { name: "Excalibur Buff", cost: 1000, value: 20 },
];

upgrades.forEach(upg => {
  const btn = document.createElement("button");
  btn.textContent = `${upg.name} - ${upg.cost} MP (+${upg.value}/s)`;
  btn.classList.add("upgrade-button");
  btn.onclick = () => buyUpgrade(upg.name, upg.cost, upg.value);
  upgradesContainer.appendChild(btn);
});
