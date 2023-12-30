const dbprofile = require("../databaseFunctions/dbProfile");
const math = require("../functions/math");
const normalPity = {
    maxPityFive : 100,
    maxPityFour : 10,
    rarityArray : { 1: 0.39, 2: 0.3, 3: 0.2, 4: 0.1, 5: 0.01 }
};

const gachaMasterPity = {
    maxPityFive : 90,
    maxPityFour : 9,
    rarityArray : { 1: 0.3, 2: 0.33, 3: 0.23, 4: 0.15, 5: 0.03 }
}; // Tiene que sumar 1


async function selectRarity(user, guild, profile) {

    let incPityFour = 1;
    let incPityFive = 1;
    const obj = profile.skills.gachamaster ? gachaMasterPity : normalPity;

    if(profile.pity.five === obj.maxPityFive){
        await dbprofile.pityFive(user);
        return 5; // Si hemos llegado a pity devolvemos un 5 estrellas
    }

    if(profile.pity.four === obj.maxPityFour){
        await dbprofile.pityFour(user);
        return 4; // Si hemos llegado a pity devolvemos un 5 estrellas
    }

    // No hay hard pity de 5 ni de 4
    const rarity = parseInt(math.weightedRandom(obj.rarityArray));

    if(rarity === 5){
        await dbprofile.pityFive(user, guild);
        return rarity;
    }

    if(rarity === 4){
        await dbprofile.pityFour(user, guild);
        return rarity;
    }

    // Si no ha salido un 4 o 5 estrellas aumentamos pity de usuario
    
    // Manejamos el caso para que no puedan coincidir los 2 pitys
    if(profile.pity.four === obj.maxPityFour-2 && profile.pity.five === obj.maxPityFive-2) incPityFive = 2;

    await dbprofile.addPity(user, guild, incPityFour, incPityFive);


    return rarity;
}

module.exports = { selectRarity }
