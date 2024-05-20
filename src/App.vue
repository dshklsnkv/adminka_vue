<template>
    <div class="buttons-container">
      <img src="/Users/darakolesnikova/adminka_vue/src/assets/logotip.jpg" alt="Логотип" class="logo">
      <span class="title">СИСТЕМА ПОДДЕРЖКИ ПРИНЯТИЯ ДИСПЕТЧЕРСКИХ РЕШЕНИЙ</span>
      <button @click="setCurrentTable('parameters')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-layout-text-window-reverse" viewBox="0 0 16 16">
  <path d="M13 6.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 .5-.5m0 3a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 .5-.5m-.5 2.5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1z"/>
  <path d="M14 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zM2 1a1 1 0 0 0-1 1v1h14V2a1 1 0 0 0-1-1zM1 4v10a1 1 0 0 0 1 1h2V4zm4 0v11h9a1 1 0 0 0 1-1V4z"/>
</svg> Параметры</button>
      <button @click="setCurrentTable('limits')"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-collection" viewBox="0 0 16 16">
  <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5z"/>
</svg> Уставки</button>
      <button @click="setCurrentTable('values')">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-justify my-svg" viewBox="0 0 16 16">
  <path d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
</svg> Значения</button>
      <button @click="setCurrentTable('datasourses')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list-task my-svg_" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5zM3 3H2v1h1z"/>
  <path d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z"/>
  <path fill-rule="evenodd" d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5zM2 7h1v1H2zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm1 .5H2v1h1z"/>
</svg> Источники данных параметров</button>
      <!-- <button @click="setCurrentTable('directoryvalues')">Значения справочников</button> -->
      <button @click="setCurrentTable('directorys')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-journals" viewBox="0 0 16 16">
  <path d="M5 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2h1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1H1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1H3a2 2 0 0 1 2-2"/>
  <path d="M1 6v-.5a.5.5 0 0 1 1 0V6h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V9h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 2.5v.5H.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H2v-.5a.5.5 0 0 0-1 0"/>
  </svg> Справочники</button>
    </div>
    <div class="tables-container">
      <LimitsTable v-if="currentTable === 'limits'" />
      <ParametersTable v-else-if="currentTable === 'parameters'" />
      <ValuesTable v-else-if="currentTable === 'values'" />
      <DatasoursesTable v-else-if="currentTable === 'datasourses'" />
      <DirectoryvaluesTable v-else-if="currentTable === 'directoryvalues'" />
      <DirectorysTable v-else-if="currentTable === 'directorys'" />
      </div>
</template>

<script>
import DirectorysTable from './DirectorysTable.vue';
import DirectoryvaluesTable from './DirectoryvaluesTable.vue';
import DatasoursesTable from './DatasoursesTable.vue';
import LimitsTable from './LimitsTable.vue';
import ParametersTable from './ParametersTable.vue';
import ValuesTable from './ValuesTable.vue';

export default {
  components: {
    LimitsTable,
    ParametersTable,
    ValuesTable,
    DatasoursesTable,
    DirectoryvaluesTable,
    DirectorysTable 
  },
  data() {
    return {
      currentTable: 'parameters', // первоначальная таблица
    };
  },
 created() {
    // Восстановление состояния при загрузке страницы
    const savedTable = localStorage.getItem('currentTable');
    if (savedTable) {
      this.currentTable = savedTable;
    }
 },
 methods: {
    setCurrentTable(tableName) {
      this.currentTable = tableName;
      localStorage.setItem('currentTable', tableName); // Сохранение состояния в localStorage
    }
 }
};
</script>
<style>
.my-svg {
  transform: translateY(2px);
}

.my-svg_ {
  transform: translateY(3px);
}
</style>

