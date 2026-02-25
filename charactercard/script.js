const character = {
    name: "Snortleblat",
    class: "Swamp Beast Ciplomat",
    level:5,
    Health: 100,
    image: "https://andejuli.github.io/wdd131/character_card/snortleblat.webp",
    attack: function() {
        if(this.Health >0) {
            this.Health -= 20;
            if (this.Health <= 0) {
                this.Health =0;
                alert(`${this.name} has died!`);
            }
            this.displayCharacter();
        }
    },

    levelUp: function() {
        this.level += 1;
        this.displayCharacter();
    },

    displayCharacter: function() {
        const cardElement = document.querySelector('#CharacterCard');
        cardElement.innerHTML = `
        <div class="card">
            <img src="${this.image}" alt="${this.name}" class="image">
            <div class="name" <h2>${this.name}</h2></div>
            <div class="stats">
                <p><strong>Class: ${this.class}</strong></p>
                <p><strong>Level: ${this.level}</strong></p>
                <p><strong>Health: ${this.Health}</strong></p>
            </div>
            <div class="buttons">
                <button onclick="character.attack()" id="attackBtn">Attack</button>
                <button onclick="character.levelUp()" id="levelUpBtn">Level Up</button>
            </div> 
        </div>
        `;
    }
};

character.displayCharacter();