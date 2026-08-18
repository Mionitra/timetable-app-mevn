<template>
  <div class="container">
    <h1>TP Vue.js - Composants dynamiques</h1>

    <button @click="activeComponent='HomeComponent'">
      Accueil
    </button>

    <button @click="activeComponent='FormComponent'">
      Formulaire
    </button>

    <hr>

    <KeepAlive>
      <component :is="activeComponent"></component>
    </KeepAlive>

  </div>
</template>

<script>
export default {
  data() {
    return {
      activeComponent: 'HomeComponent'
    }
  }
}
</script>

<style scoped>
.container{
  width:70%;
  margin:auto;
  text-align:center;
}

button{
  margin:10px;
  padding:10px 20px;
  cursor:pointer;
}
</style>