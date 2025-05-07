let mana = 0;
let manaPerSecond = 0;

const manaDisplay = document.getElementById("mana-count");
const manaPerSecDisplay = document.getElementById("mana-rate");
const clickButton = document.getElementById("click-button");
const upgradesContainer = document.getElementById("upgrades");
const noManaText = document.getElementById("no_mana");
const servantArea = document.getElementById("summoned-servants"); 

function updateDisplay() {
  manaDisplay.textContent = `Mana: ${Math.floor(mana)} MP`;
  manaPerSecDisplay.textContent = `MP/sec: ${manaPerSecond}`;
}

function gainMana(amount) {
  mana += amount;
  updateDisplay();
}
const summonedServants = {};
function buyUpgrade(name, cost, value, image) {
  const noManaText = document.getElementById("no_mana");

  if (summonedServants[name]) {
    noManaText.innerHTML = `<h2>${name} already summoned!</h2>`;
    setTimeout(() => {
      noManaText.innerHTML = "";
    }, 2000);
    return;
  }

  if (mana >= cost) {
    mana -= cost;
    manaPerSecond += value;
    summonedServants[name] = true; 
    updateDisplay();

  
    const servantArea = document.getElementById("summoned-servants");
    const img = document.createElement("img");
    img.src = image;
    img.alt = name;
    img.classList.add("servant-img");
    servantArea.appendChild(img);

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

const upgrades = [
  { name: "Summon Saber", cost: 50, value: 1, image: "images/saber.png" },
  { name: "Summon Gilgamesh", cost: 200, value: 5, image: "images/gilgamesh1.png" },
  { name: "Excalibur Buff", cost: 1000, value: 20, image: "images/excalibur.png" },
];

upgrades.forEach(upg => {
  const btn = document.createElement("button");
  btn.textContent = `${upg.name} - ${upg.cost} MP (+${upg.value}/s)`;
  btn.classList.add("upgrade-button");
  btn.onclick = () => buyUpgrade(upg.name, upg.cost, upg.value, upg.image);
  upgradesContainer.appendChild(btn);
});

