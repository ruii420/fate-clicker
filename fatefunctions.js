let mana = 0;
let manaPerSecond = 0;
let manaMultiplier = 1;
let clickPower = 1;
let tickRate = 1000;
let tickInterval;

const manaDisplay = document.getElementById("mana-count");
const manaPerSecDisplay = document.getElementById("mana-rate");
const clickButton = document.getElementById("click-button");
const noManaText = document.getElementById("no_mana");
const servantArea = document.getElementById("summoned-servants");
const summonedServants = {};
const goal = document.getElementById("goal");
const sounds = {
  click: new Audio('sounds/click.mp3'),
  evolve: new Audio('sounds/evolve.mp3'),
  summon: new Audio('sounds/summon.mp3'),
  holy: new Audio('sounds/holy.mp3')
};
function playSound(soundType) {
 
      sounds[soundType].play();
    
}

window.playSound = playSound;

function updateDisplay() {
  manaDisplay.textContent = `Mana: ${Math.floor(mana)} MP`;
  let baseRate = 0;
  for (const servantName in summonedServants) {
    const servant = summonedServants[servantName];
    if (servantName !== "Rin") {
      baseRate += servant.value;
    }
  }
  const effectiveRatePerSec = manaPerSecond * (1000/tickRate);
  let displayText = `MP/sec: ${baseRate}   (x${manaMultiplier})`;
  if (tickRate !== 1000) {
    displayText += ` [${(1000/tickRate).toFixed(1)}x faster]`;
  }
  displayText += ` | Click: +${clickPower} MP`;
  manaPerSecDisplay.textContent = displayText;
  manaPerSecDisplay.classList.add("text_color");
  updateGrailImage(mana);
}


function gainMana(amount) {
  mana += amount;
  updateDisplay();
}

function updateClickPower() {
  clickPower = 1;
  if (summonedServants["Shirou"]) {
    const clickServant = summonedServants["Shirou"];
    const evolutionLevel = clickServant.evolutionLevel;
    if (evolutionLevel === 0) {
      clickPower += clickServant.data.clickBonus;
    } else if (evolutionLevel === 1) {
      clickPower += clickServant.data.evolve1.clickBonus;
    } else if (evolutionLevel === 2) {
      clickPower += clickServant.data.evolve2.clickBonus;
    }
  }
  updateDisplay();
}

function reccalcmana() {
  let baseRate = 0;
  for (const servantName in summonedServants) {
    const servant = summonedServants[servantName];
    if (servantName !== "Rin" && 
        servantName !== "Shirou") {
      baseRate += servant.value;
    }
  }
  manaPerSecond = baseRate * manaMultiplier;
  updateDisplay();
}

function updateMultiplier() {
  manaMultiplier = 1;
  if (summonedServants["Rin"]) {
    const multiplierServant = summonedServants["Rin"];
    const evolutionLevel = multiplierServant.evolutionLevel;
    if (evolutionLevel === 0) {
      manaMultiplier = multiplierServant.data.multiplier;
    } else if (evolutionLevel === 1) {
      manaMultiplier = multiplierServant.data.evolve1.multiplier;
    } else if (evolutionLevel === 2) {
      manaMultiplier = multiplierServant.data.evolve2.multiplier;
    }
  }
  reccalcmana();
}

function summonServant(upg) {
  if (summonedServants[upg.name]) {
    noManaText.innerHTML = `<h2>${upg.name} already summoned!</h2>`;
    setTimeout(() => (noManaText.innerHTML = ""), 2000);
    return;
  }

  if (mana >= upg.cost) {
    mana -= upg.cost;
    window.playSound('summon')
    summonedServants[upg.name] = {
      evolutionLevel: 0,
      data: upg,
      value: upg.value
    };

    const img = document.createElement("img");
    img.src = upg.image;
    img.alt = upg.name;
    img.classList.add("servant-img");
    servantArea.appendChild(img);
    const btnContainer = document.getElementById(upg.buttonContainerId);
    btnContainer.innerHTML = "";
    const evolveBtn = document.createElement("button");
    evolveBtn.classList.add("evolve-button", "upgrade-button");
    evolveBtn.textContent = `Evolve ${upg.name} (Cost: ${upg.evolve1.cost} MP)`;
    evolveBtn.onclick = () => evolveServant(upg.name, 1, evolveBtn);
    btnContainer.appendChild(evolveBtn);

    if (upg.name === "Rin") {
      updateMultiplier();
    } 
    else if (upg.name === "Shirou") {
      updateClickPower();
    }
    else if (upg.name === "Gilgamesh") {
      updateGilgameshEffect();
    }
    reccalcmana();
    saveGame();
  } else {
    noManaText.innerHTML = "<h2>Not enough mana</h2>";
    setTimeout(() => (noManaText.innerHTML = ""), 2000);
  }
}

function evolveServant(servantName, stage, button) {
  const servant = summonedServants[servantName];
  if (!servant) return;
  let evolveCost;
  let newValue;
  let newImage;
  if (stage === 1) {
    evolveCost = servant.data.evolve1.cost;
    newValue = servant.data.evolve1.value;
    newImage = servant.data.evolve1.image;
  } else if (stage === 2) {
    evolveCost = servant.data.evolve2.cost;
    newValue = servant.data.evolve2.value;
    newImage = servant.data.evolve2.image;
  }
  if (mana >= evolveCost) {
    mana -= evolveCost;
    servant.evolutionLevel = stage;
    servant.value = newValue;
    window.playSound('evolve')
    const servantImages = servantArea.getElementsByTagName("img");
    for (let img of servantImages) {
      if (img.alt === servantName) {
        img.src = newImage;
        break;
      }
    }
    
    if (stage === 1) {
      button.textContent = `Evolve ${servantName} (Cost: ${servant.data.evolve2.cost} MP)`;
      button.onclick = () => evolveServant(servantName, 2, button);
    } else {
      button.textContent = `${servantName} fully evolved!`;
      button.disabled = true;
    }
    if (servantName === "Rin") {
      updateMultiplier();
    } 
    else if (servantName === "Shirou") {
      updateClickPower();
    }
    else if (servantName === "Gilgamesh") {
      updateGilgameshEffect();
    }
    else {
      reccalcmana();
    }
    updateDisplay();
    saveGame();
  } else {
    noManaText.innerHTML = "<h2>Not enough mana</h2>";
    setTimeout(() => (noManaText.innerHTML = ""), 2000);
  }
}

function berserkergamba() {
  if (summonedServants["Berserker"]) {
    const riskServant = summonedServants["Berserker"];
    const evolutionLevel = riskServant.evolutionLevel;
    let baseValue, riskChance, penaltyPercent;
    if (evolutionLevel === 0) {
      baseValue = riskServant.data.value;
      riskChance = riskServant.data.riskChance;
      penaltyPercent = riskServant.data.penaltyPercent;
    } else if (evolutionLevel === 1) {
      baseValue = riskServant.data.evolve1.value;
      riskChance = riskServant.data.evolve1.riskChance;
      penaltyPercent = riskServant.data.evolve1.penaltyPercent;
    } else if (evolutionLevel === 2) {
      baseValue = riskServant.data.evolve2.value;
      riskChance = riskServant.data.evolve2.riskChance;
      penaltyPercent = riskServant.data.evolve2.penaltyPercent;
    }
    const valueWithMultiplier = baseValue * manaMultiplier;
    if (Math.random() < riskChance) {
      const penaltyAmount = Math.floor(mana * (penaltyPercent / 100));
      mana -= penaltyAmount;
      if (mana < 0) mana = 0;
      const servantImages = servantArea.getElementsByTagName("img");
      for (let img of servantImages) {
        if (img.alt === "Berserker") {
          img.style.filter = "drop-shadow(0 0 10px red)";
          setTimeout(() => {
            img.style.filter = "";
          }, 1000);
          break;
        }
      }
    } else {
      gainMana(valueWithMultiplier);
      const servantImages = servantArea.getElementsByTagName("img");
      for (let img of servantImages) {
        if (img.alt === "Berserker") {
          img.style.filter = "drop-shadow(0 0 10px green)";
          setTimeout(() => {
            img.style.filter = "";
          }, 1000);
          break;
        }
      }
    }
  }
}

function updateTickRate() {
  if (tickInterval) {
    clearInterval(tickInterval);
  }
  tickInterval = setInterval(() => {
    mana += manaPerSecond * (tickRate/1000);
    berserkergamba();
    updateDisplay();
    saveGame();
  }, tickRate);
}

function updateGilgameshEffect() {
  tickRate = 1000;
  if (summonedServants["Gilgamesh"]) {
    const gilgamesh = summonedServants["Gilgamesh"];
    const evolutionLevel = gilgamesh.evolutionLevel;
    if (evolutionLevel === 0) {
      tickRate = 800;
    } else if (evolutionLevel === 1) {
      tickRate = 667;
    } else if (evolutionLevel === 2) {
      tickRate = 500;
    }
  }
  updateTickRate();
}

function saveGame() {
  const gameData = {
    mana: mana,
    manaPerSecond: manaPerSecond,
    manaMultiplier: manaMultiplier,
    clickPower: clickPower,
    tickRate: tickRate,
    summonedServants: {}
  };
  for (const servantName in summonedServants) {
    const servant = summonedServants[servantName];
    gameData.summonedServants[servantName] = {
      evolutionLevel: servant.evolutionLevel,
      value: servant.value,
      name: servantName 
    };
  }
  localStorage.setItem('idleGameSave', JSON.stringify(gameData));
}
const grailThresholds = [
  { mana: 0, image: "images/Holy_Grail.png" },     
  { mana: 100, image: "images/Holy_Grail2.png" },  
  { mana: 250, image: "images/Holy_Grail3.png" },  
  { mana: 750, image: "images/Holy_Grailglow1.png" },  
  { mana: 1250, image: "images/Holy_Grailglow2.png" },  
  { mana: 2500, image: "images/Holy_Grailglow3.png" },  
  { mana: 5000, image: "images/Holy_Grailglow4.png" },
  { mana: 10000, image: "images/greater_grail.jpg" }   
];
function getCurrentGrailImage(currentMana) {
  const sortedThresholds = [...grailThresholds].sort((a, b) => b.mana - a.mana);
  if (currentMana >= 10000) {
    goal.innerHTML = "<h1>Greater Grail Summoned</h1>";
    
  }
  
  for (const threshold of sortedThresholds) {
    if (currentMana >= threshold.mana) {
      return threshold.image;
    }
  }
  return grailThresholds[0].image;
}

function updateGrailImage(currentMana) {
  const grailImage = document.getElementById("click-button");
  if (!grailImage) return;
  const newImageSrc = getCurrentGrailImage(currentMana);
  if (grailImage.src.split('/').pop() !== newImageSrc.split('/').pop()) {
    grailImage.src = newImageSrc;
    grailImage.classList.add("grail-upgrade");
    setTimeout(() => {
      grailImage.classList.remove("grail-upgrade");
    }, 1000);
  }
}


function initGrailSystem() {
  
  updateGrailImage(mana); 
}
const upgrades = [
  {
    name: "Saber",
    cost: 50,
    value: 1,
    image: "images/saber.png",
    evolve1: {
      cost: 150,
      value: 3,
      image: "images/saber2.png"
    },
    evolve2: {
      cost: 500,
      value: 7,
      image: "images/saber3.png"
    },
    buttonContainerId: "saber_button"
  },
  {
    name: "Gilgamesh",
    cost: 200,
    value: 5,
    image: "images/gilgamesh1.png",
    evolve1: {
      cost: 500,
      value: 10,
      image: "images/gilgamesh2.png"
    },
    evolve2: {
      cost: 1500,
      value: 20,
      image: "images/gilgamesh3.png"
    },
    buttonContainerId: "gilgamesh_button"
  },
  {
    name: "Rin",
    cost: 10,
    value: 0,
    multiplier: 2,
    image: "images/rin.png",
    evolve1: {
      cost: 20,
      value: 0,
      multiplier: 3,
      image: "images/rin2.png"
    },
    evolve2: {
      cost: 30,
      value: 0,
      multiplier: 5,
      image: "images/rin3.png"
    },
    buttonContainerId: "rin_button"
  },
  {
    name: "Shirou",
    cost: 25,
    value: 0,
    clickBonus: 1,
    image: "images/Shirou.png",
    evolve1: {
      cost: 100,
      value: 0,
      clickBonus: 4,
      image: "images/Shirou2.png"
    },
    evolve2: {
      cost: 300,
      value: 0,
      clickBonus: 9,
      image: "images/Shirou3.png"
    },
    buttonContainerId: "shirou_button"
  },
  {
    name: "Berserker",
    cost: 100,
    value: 15,
    riskChance: 0.3,
    penaltyPercent: 30,
    image: "images/Berserker.png",
    evolve1: {
      cost: 400,
      value: 30,
      riskChance: 0.2,
      penaltyPercent: 25,
      image: "images/Berserker2.png"
    },
    evolve2: {
      cost: 1000,
      value: 60,
      riskChance: 0.05,
      penaltyPercent: 20,
      image: "images/Berserker3.png"
    },
    buttonContainerId: "berserker_button"
  }
];

function createSummonButtons() {
  upgrades.forEach(upg => {
    if (summonedServants[upg.name]) return;
    const container = document.getElementById(upg.buttonContainerId);
    container.innerHTML = '';
    const btn = document.createElement("button");
    if (upg.name === "Rin") {
      btn.textContent = `Summon ${upg.name} - ${upg.cost} MP (x${upg.multiplier} MP/s)`;
    } 
    else if (upg.name === "Shirou") {
      btn.textContent = `Summon ${upg.name} - ${upg.cost} MP (+${upg.clickBonus} MP/click)`;
    }
    else if (upg.name === "Berserker") {
      btn.textContent = `Summon ${upg.name} - ${upg.cost} MP (+${upg.value}/s, but ${upg.riskChance*100}% risk)`;
    }
    else if (upg.name === "Gilgamesh") {
      btn.textContent = `Summon ${upg.name} - ${upg.cost} MP (+${upg.value}/s, 20% faster time)`;
    }
    else {
      btn.textContent = `Summon ${upg.name} - ${upg.cost} MP (+${upg.value}/s)`;
    }
    btn.classList.add("upgrade-button");
    btn.onclick = () => summonServant(upg);
    container.appendChild(btn);
  });
}

function loadGame() {
  const savedData = localStorage.getItem('idleGameSave');
  if (!savedData) {
    createSummonButtons(); 
    return;
  }
  const gameData = JSON.parse(savedData);
  mana = gameData.mana || 0;
  manaPerSecond = gameData.manaPerSecond || 0;
  manaMultiplier = gameData.manaMultiplier || 1;
  clickPower = gameData.clickPower || 1;
  tickRate = gameData.tickRate || 1000;
  servantArea.innerHTML = '';
  for (const servantName in gameData.summonedServants) {
    const savedServant = gameData.summonedServants[servantName];
    const servantData = upgrades.find(upg => upg.name === servantName);
    if (!servantData) continue;
    summonedServants[servantName] = {
      evolutionLevel: savedServant.evolutionLevel,
      data: servantData,
      value: savedServant.value
    };
    const img = document.createElement("img");
    if (savedServant.evolutionLevel === 0) {
      img.src = servantData.image;
    } else if (savedServant.evolutionLevel === 1) {
      img.src = servantData.evolve1.image;
    } else if (savedServant.evolutionLevel === 2) {
      img.src = servantData.evolve2.image;
    }
    img.alt = servantName;
    img.classList.add("servant-img");
    servantArea.appendChild(img);
    const btnContainer = document.getElementById(servantData.buttonContainerId);
   
    btnContainer.innerHTML = "";
    if (savedServant.evolutionLevel < 2) {
      const evolveBtn = document.createElement("button");
      evolveBtn.classList.add("evolve-button", "upgrade-button");
      if (savedServant.evolutionLevel === 0) {
        evolveBtn.textContent = `Evolve ${servantName} (Cost: ${servantData.evolve1.cost} MP)`;
        evolveBtn.onclick = () => evolveServant(servantName, 1, evolveBtn);
      } else {
        evolveBtn.textContent = `Evolve ${servantName} (Cost: ${servantData.evolve2.cost} MP)`;
        evolveBtn.onclick = () => evolveServant(servantName, 2, evolveBtn);
      }   
      btnContainer.appendChild(evolveBtn);
    } else {
      const evolveBtn = document.createElement("button");
      evolveBtn.classList.add("evolve-button", "upgrade-button");
      evolveBtn.textContent = `${servantName} fully evolved!`;
      evolveBtn.disabled = true;
      btnContainer.appendChild(evolveBtn);
    }
  }
  createSummonButtons();
  updateTickRate();
  updateDisplay();
}

function addResetButton() {
  const existingResetBtn = document.querySelector(".reset-button");
  if (existingResetBtn) {
    existingResetBtn.remove();
  }
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset Game";
  resetBtn.classList.add("reset-button");

  resetBtn.onclick = () => {
      localStorage.removeItem('idleGameSave');
      mana = 0;
      manaPerSecond = 0;
      manaMultiplier = 1;
      clickPower = 1;
      tickRate = 1000;
      for (const key in summonedServants) {
        delete summonedServants[key];
      }
      servantArea.innerHTML = "";
      createSummonButtons();
      updateTickRate();
      updateDisplay();
    
  };
  document.body.appendChild(resetBtn);
  resetBtn.classList.add("upgrade-button");
}

function initGame() {
  loadGame();
  addResetButton();
  initGrailSystem()
  clickButton.addEventListener("click", () => {
    gainMana(clickPower);
    window.playSound('click')
    clickButton.classList.add("clicked");
    setTimeout(() => clickButton.classList.remove("clicked"), 150);
  });
  updateDisplay();
}
initGame();
