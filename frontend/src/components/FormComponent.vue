<template>

    <div class="formulaire">

        <h2>Formulaire d'inscription</h2>

        <form @submit.prevent="envoyer">

            <label>Nom</label><br>
            <input type="text" v-model="nom">

            <br><br>

            <label>Prénom</label><br>
            <input type="text" v-model="prenom">

            <br><br>

            <label>Email</label><br>
            <input type="email" v-model="email">

            <br><br>

            <label>Mot de passe</label><br>
            <input type="password" v-model="password">

            <br><br>

            <label>Âge</label><br>
            <input type="number" min="18" max="60" v-model="age">

            <br><br>

            <label>Date de naissance</label><br>
            <input type="date" v-model="dateNaissance">

            <br><br>

            <label>Couleur préférée</label><br>
            <input type="color" v-model="couleur">

            <br><br>

            <label>Photo</label><br>
            <input type="file">

            <br><br>

            <label>Site Web</label><br>
            <input type="url" v-model="site">

            <br><br>

            <label>Téléphone</label><br>
            <input type="tel" v-model="telephone">

            <br><br>

            <label>Sexe</label><br>

            <input type="radio" value="Homme" v-model="sexe">

            Homme

            <input type="radio" value="Femme" v-model="sexe">

            Femme

            <br><br>

            <label>Langages connus</label><br>

            <input type="checkbox" value="HTML" v-model="langages">

            HTML

            <input type="checkbox" value="CSS" v-model="langages">

            CSS

            <input type="checkbox" value="JavaScript" v-model="langages">

            JavaScript

            <input type="checkbox" value="Vue.js" v-model="langages">

            Vue.js

            <br><br>

            <label>Pays</label>

            <br>

            <select v-model="pays">

                <option>Madagascar</option>

                <option>France</option>

            </select>

            <br><br>

            <label>Commentaires</label>

            <br>

            <textarea rows="5" cols="40" v-model="commentaire">
</textarea>

            <br><br>

            <input type="reset" value="Réinitialiser">

            <input type="submit" value="Envoyer">

        </form>

        <hr>

        <h3>Résultat</h3>

        <p><strong>Nom :</strong> {{ nom }}</p>

        <p><strong>Prénom :</strong> {{ prenom }}</p>

        <p><strong>Email :</strong> {{ email }}</p>

        <p><strong>Âge :</strong> {{ age }}</p>

        <p><strong>Sexe :</strong> {{ sexe }}</p>

        <p><strong>Pays :</strong> {{ pays }}</p>

        <p><strong>Langages :</strong> {{ langages.join(', ') }}</p>

        <p><strong>Commentaire :</strong> {{ commentaire }}</p>

    </div>

</template>

<script>
export default {

    data() {

        return {

            nom: "",
            prenom: "",
            email: "",
            password: "",
            age: null,
            dateNaissance: "",
            heure: "",
            couleur: "#000000",
            site: "",
            telephone: "",
            sexe: "",
            langages: [],
            pays: "Madagascar",
            commentaire: ""

        }

    },

    methods: {

        envoyer() {
            alert("Formulaire envoyé !");
        }

    }

}
</script>

<style scoped>
.formulaire {

    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    text-align: left;

}

input,
select,
textarea {

    width: 100%;
    padding: 8px;
    margin-top: 5px;

}

input[type=radio],
input[type=checkbox] {

    width: auto;

}

input[type=submit],
input[type=reset] {

    width: 150px;
    margin-right: 10px;
    cursor: pointer;

}
</style>