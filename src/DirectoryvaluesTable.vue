<script setup>

import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag';
import { parseISO, format } from 'date-fns';
import { ref, reactive, computed, watchEffect } from 'vue';

function findDirectoryNameById(id) {
    const directory = this.directoryvalues.find(dir => dir.idDirectory === id);
    return directory? directory.DirectoryName[0]?.nameDirectory || '' : '';
  }

const props = defineProps({
 directory: Number, 
});

const itemsPerPage = 13; // Количество элементов на странице
const currentPage = ref(1); // Текущая страница
const totalPages = computed(() => Math.ceil(directoryvalues.value.length / itemsPerPage)); // Общее количество страниц

// function previousPage() {
//  if (currentPage.value > 1) {
//     currentPage.value--;
//  }
// }

function nextPage() {
 if (currentPage.value < totalPages.value) {
    currentPage.value++;
 }
}

const paginatedDirectoryvalues = computed(() => {
 const start = (currentPage.value - 1) * itemsPerPage;
 const end = start + itemsPerPage;
 return sortedDirectoryvalues.value.slice(start, end);
});

const showFilter = ref(false); // Инициализация переменной showFilter как false
const toggleFilter = () => {
      showFilter.value = !showFilter.value; // Переключение значения showFilter при каждом нажатии на кнопку
    };

// const filterLongName = ref(''); // Фильтр по длинному названию
// const filterShortName = ref(''); // Фильтр по короткому названию
// const filterIdDirectory = ref(''); // Фильтр по справочнику
const sortField = ref(''); // Поле для сортировки по умолчанию
const sortDirection = ref('asc'); // Направление сортировки по умолчанию

// const filteredDirectoryvalues = computed(() => {
//  return sortedDirectoryvalues.value.filter(directoryvalue => {
//     const longNameMatches = !filterLongName.value || directoryvalue.longName.toLowerCase().includes(filterLongName.value.toLowerCase());
//     const shortNameMatches = !filterShortName.value || directoryvalue.shortName.toLowerCase().includes(filterShortName.value.toLowerCase());
//     const idDirectoryMatches = !filterIdDirectory.value || directoryvalue.idDirectory.toString().includes(filterIdDirectory.value);
//     return longNameMatches && shortNameMatches && idDirectoryMatches;
//  });
// }); 

const sortedDirectoryvalues = computed(() => {
 return [...directoryvalues.value].sort((a, b) => {
    const fieldA = a[sortField.value];
    const fieldB = b[sortField.value];
    if (fieldA < fieldB) {
      return sortDirection.value === 'asc' ? -1 : 1;
    }
    if (fieldA > fieldB) {
      return sortDirection.value === 'asc' ? 1 : -1;
    }
    return 0;
 });
});

function sort(field) {
 if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
 } else {
    sortField.value = field;
    sortDirection.value = 'asc';
 }
}

const displaySettingsDirectory = reactive({
 showIdDirectory: false,
 showLongName: true,
 showShortName: true,
 showMomentBegin: false,
 showMomentEnd: false,
});

const showModal__ = ref(false);
function openModal_() {
  showModal__.value = true;
}

function formatDateTime(dateTimeString) {
 const date = parseISO(dateTimeString);
 return format(date, "yyyy-MM-dd HH:mm:ss.SSS");
}

const ALL_DIRECTORYVALUES_QUERY = gql`
query MyQuery($shortName: String, $longName: String, $idDirectory: [Int!], $momentBegin: DateTime, $momentEnd: DateTime) {
 DirectoryValues(shortName: $shortName, longName: $longName, idDirectory: $idDirectory, momentBegin: $momentBegin, momentEnd: $momentEnd) {
    idDirectoryvalue
    idDirectory
    longName
    shortName
    momentBegin
    momentEnd
    DirectoryName {
      nameDirectory
    }
  }
}
`;

const shortName = ref('');
const longName = ref('');
const idDirectory = ref([]);
const momentBegin = ref(null);
const momentEnd = ref(null);

const {result: resultdv} = useQuery(ALL_DIRECTORYVALUES_QUERY,() => ({
  shortName: shortName.value,
  longName: longName.value,
  idDirectory: props.directory,
  momentBegin: momentBegin.value,
  momentEnd: momentEnd.value
}));

// Функция для сброса фильтров
const resetFilters = () => {
 shortName.value = '';
 longName.value = '';
 idDirectory.value = [];
 momentBegin.value = null;
 momentEnd.value = null;
};

const directoryvalues = computed(() => resultdv.value?.DirectoryValues ?? [])

watchEffect(() => {
 console.log(directoryvalues.value);
});


// Функция для получения уникальных значений из массива объектов
function getUniqueValues(array, key) {
 return [...new Set(array.map(item => item[key]))];
}

// Вычисляемые свойства для получения уникальных значений для каждого из полей
const uniqueIdDirectories = computed(() => getUniqueValues(directoryvalues.value, 'idDirectory'));
const uniqueLongNames = computed(() => getUniqueValues(directoryvalues.value, 'longName'));
const uniqueShortNames = computed(() => getUniqueValues(directoryvalues.value, 'shortName'));
const uniqueMomentBegins = computed(() => getUniqueValues(directoryvalues.value, 'momentBegin'));
const uniqueMomentEnds = computed(() => getUniqueValues(directoryvalues.value, 'momentEnd'));


const DELETE_DIRECTORYVALUE_MUTATION = gql`
mutation deleteDirectoryvalue($directoryvalueId: Int!) {
 deleteDirectoryvalue(directoryvalueId: $directoryvalueId)
}
`;
const { mutate: deleteDirectoryvalue } = useMutation(DELETE_DIRECTORYVALUE_MUTATION, {
 refetchQueries: [{ query: ALL_DIRECTORYVALUES_QUERY }],
});
// Функция для удаления параметра с подтверждением
const deleteDirectoryvalueWithConfirm = (directoryvalueId) => {
 if (window.confirm('Вы уверены, что хотите удалить это значение справочника?')) {
    deleteDirectoryvalue({ directoryvalueId })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при удалении:', error);
      });
 }
};

const UPDATE_DIRECTORYVALUE_MUTATION = gql`
mutation updateDirectoryvalue( $directoryvalueData: DirectoryValueInput!, $directoryvalueId: Int!) {
 updateDirectoryvalue(directoryvalueData: $directoryvalueData, directoryvalueId: $directoryvalueId) 
}
`;
const { mutate: updateDirectoryvalue } = useMutation(UPDATE_DIRECTORYVALUE_MUTATION, {
 refetchQueries: [{ query: ALL_DIRECTORYVALUES_QUERY }],
});
const showModal_directoryvalue = ref(false);
const editingDirectoryvalueId = ref(null);
const newDirectoryvalueData = reactive({
 idDirectory: '',
 longName: '',
 shortName:'',
 momentBegin:'',
 momentEnd:''
});

const editingDirectoryvalue = (directoryvalueId) => {
 const directoryvalue = directoryvalues.value.find(p => p.idDirectoryvalue === directoryvalueId);
 if (directoryvalue) {
    editingDirectoryvalueId.value = directoryvalueId;
    newDirectoryvalueData.idDirectoryvalue = directoryvalue.idDirectoryvalue; 
    newDirectoryvalueData.idDirectory = directoryvalue.idDirectory;
    newDirectoryvalueData.longName = directoryvalue.longName;
    newDirectoryvalueData.shortName = directoryvalue.shortName;
    newDirectoryvalueData.momentBegin = directoryvalue.momentBegin;
    newDirectoryvalueData.momentEnd = directoryvalue.momentEnd;
    showModal_directoryvalue.value = true;
 }
};

const UpdateDirectoryValueWithConfirm = () => {
 if (window.confirm('Вы уверены, что хотите сохранить изменения?')) {
    newDirectoryvalueData.idDirectory = parseInt(newDirectoryvalueData.idDirectory, 10);
    updateDirectoryvalue({ directoryvalueId: editingDirectoryvalueId.value, directoryvalueData: newDirectoryvalueData })
      .then(() => {
        editingDirectoryvalueId.value = null; // Сбросить ID редактируемого параметра
        showModal_directoryvalue.value = false;
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при обновлении:', error);
      });
 }
};

const CREATE_DIRECTORYVALUE_MUTATION = gql`
mutation createDirectoryvalue($directoryvalueData: DirectoryValueInput!) {
 createDirectoryvalue(directoryvalueData: $directoryvalueData) {
    idDirectoryvalue
    idDirectory
    longName
    shortName
    momentBegin
    momentEnd
 }
}
`;

const showModal_directoryvalue_ = ref(false);
    const newDirectoryvalue = ref({
      idDirectoryvalue: '',
      idDirectory: '',
      longName: '',
      shortName: '',
      momentBegin: '',
      momentEnd: '',
    });

    const { mutate: createDirectoryvalue } = useMutation(CREATE_DIRECTORYVALUE_MUTATION, {
      refetchQueries: [{ query: ALL_DIRECTORYVALUES_QUERY }],
    });

    function openModal() {
      showModal_directoryvalue_.value = true;
    }

    function addDirectoryvalue() {
      const directoryvalueData = {
    ...newDirectoryvalue.value,
    idDirectoryvalue:parseInt(newDirectoryvalue.value.idDirectoryvalue,10),
    idDirectory:parseInt(newDirectoryvalue.value.idDirectory, 10)
 };
      createDirectoryvalue({ directoryvalueData})
        .then(() => {
          showModal_directoryvalue_.value = false;
        })
        .catch((error) => {
          console.error('Ошибка при создании нового параметра:', error);
        });
};

</script>

<template>
  <div>
</div>
<div class="container">
<div class="left-panel">
  <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th colspan="8">
              <div class="header-container" style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin-left: 5px;">Значения справочников</h2>
                <div>
                    <button @click="openModal_" class="btn btn-primary btn-small"><i class="material-icons">more_vert</i></button>
                    <button @click="toggleFilter" class="btn btn-primary btn-small"><i class="material-icons">filter_list</i></button>
                    <button @click="openModal" class="btn btn-primary btn-small"><i class="material-icons">add</i></button>
                </div>
                </div>
              <div>
                <div v-if="showModal__" class="modal">
                <div class="modal-content_">
                  <span class="close" @click="showModal__ = false">&times;</span>
                    <h5 class="modal-title">Настройка отображения полей</h5>
                <div class="label-container">
                <label>
                    <input type="checkbox" v-model="displaySettingsDirectory.showIdDirectory">
                    Справочник
                </label>
                <label>
                  <input type="checkbox" v-model="displaySettingsDirectory.showLongName">
                    Длинное название
                </label>
                <label>
                  <input type="checkbox" v-model="displaySettingsDirectory.showShortName">
                    Короткое название
                </label>
                <label>
                 <input type="checkbox" v-model="displaySettingsDirectory.showMomentBegin">
                 Момент начала
              </label>
              <label>
                 <input type="checkbox" v-model="displaySettingsDirectory.showMomentEnd">
                 Момент конца 
              </label>
                </div>
                </div>
                </div>
                </div>
            </th>
          </tr>
          <tr v-if="showFilter">
              <td colspan="6">
                  <select v-model="idDirectory">
                    <option v-for="id in uniqueIdDirectories" :key="id" :value="id">
                      {{ findDirectoryNameById(id) }}
                    </option>
                  </select>
                  <select v-model="longName">
                    <option value="">Выберите длинное название</option>
                    <option v-for="name in uniqueLongNames" :key="name" :value="name">
                      {{ name }}
                    </option>
                  </select>
                  <select v-model="shortName">
                    <option value="">Выберите короткое название</option>
                    <option v-for="name in uniqueShortNames" :key="name" :value="name">
                      {{ name }}
                    </option>
                  </select>
                  <select v-model="momentBegin" v-if="displaySettingsDirectory.showMomentBegin">
                    <option v-for="date in uniqueMomentBegins" :key="date" :value="date">
                      {{ date }}
                    </option>
                  </select>
                  <select v-model="momentEnd" v-if="displaySettingsDirectory.showMomentEnd">
                    <option v-for="date in uniqueMomentEnds" :key="date" :value="date">
                      {{ date }}
                    </option>
                  </select>
                <button @click="resetFilters">Сбросить фильтры</button>
              </td>
          </tr>
          <!-- <td colspan="4">
              <input class="filter-input" v-model="filterIdDirectory" placeholder="Фильтр по справочнику" />
              <input class="filter-input" v-model="filterLongName" placeholder="Фильтр по длинному названию" />
              <input class="filter-input" v-model="filterShortName" placeholder="Фильтр по короткому названию" />
          </td> -->
        <tr>
 <th v-if="displaySettingsDirectory.showIdDirectory" @click="sort('idDirectory')">
    Справочник 
    <span v-if="sortField === 'idDirectory'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
 </th>
 <th v-if="displaySettingsDirectory.showLongName" @click="sort('longName')">
    Длинное название 
    <span v-if="sortField === 'longName'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
 </th>
 <th v-if="displaySettingsDirectory.showShortName" @click="sort('shortName')">
    Короткое название 
    <span v-if="sortField === 'shortName'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
 </th>
 <th v-if="displaySettingsDirectory.showMomentBegin">Момент начала</th>
<th v-if="displaySettingsDirectory.showMomentEnd">Момент конца</th>
 <th>Действия</th>
</tr>
           </thead>
           <tbody v-if="sortedDirectoryvalues.length">
          <tr v-for="directoryvalue in paginatedDirectoryvalues" :key="directoryvalue.idDirectoryvalue">
          <td v-if="displaySettingsDirectory.showIdDirectory">{{ directoryvalue.DirectoryName [0].nameDirectory }}</td>
          <td v-if="displaySettingsDirectory.showLongName">{{ directoryvalue.longName }}</td>
          <td v-if="displaySettingsDirectory.showShortName">{{ directoryvalue.shortName }}</td>
          <td v-if="displaySettingsDirectory.showMomentBegin">{{ formatDateTime(directoryvalue.momentBegin) }}</td>
          <td v-if="displaySettingsDirectory.showMomentEnd">{{ formatDateTime(directoryvalue.momentEnd) }}</td>
          <td>
            <button @click="deleteDirectoryvalueWithConfirm(directoryvalue.idDirectoryvalue)" class="btn btn-danger btn-small"><i class="material-icons">delete</i></button>
            <button @click="editingDirectoryvalue(directoryvalue.idDirectoryvalue)" class="btn btn-primary btn-small"><i class="material-icons">edit</i></button>
          </td>
        </tr>
      </tbody>
         </table>
         <!-- <div class="pagination d-flex justify-content-start align-items-end">
        <button class="btn btn-secondary" style="margin-right: 10px;" @click="previousPage">Предыдущая</button>
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        <button class="btn btn-secondary" style="margin-left: 10px;" @click="nextPage">Следующая</button>
        </div> -->
         <div v-if="showModal_directoryvalue" class="modal">
 <div class="modal-content">
  <span class="close" @click="showModal_directoryvalue= false">&times;</span>
      <form @submit.prevent="UpdateDirectoryValueWithConfirm">
        <label for="idParameter">Справочник:</label> 
        <input v-model="newDirectoryvalueData.idDirectory" placeholder="Справочник">
        <label for="longName">Длинное название:</label>
        <input v-model="newDirectoryvalueData.longName" placeholder="Длинное название">
        <label for="shortName">Короткое название:</label>
        <input v-model="newDirectoryvalueData.shortName" placeholder="Короткое название">
        <label for="momentBegin">Момент начала:</label> 
        <input v-model="newDirectoryvalueData.momentBegin" placeholder="моментначала">
        <label for="momentEnd">Момент конца:</label> 
        <input v-model="newDirectoryvalueData.momentEnd" placeholder="моментконца">
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
 </div>
    <div style="overflow: hidden;">
    <div v-if="showModal_directoryvalue_" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal_directoryvalue_ = false">&times;</span>
      <form @submit.prevent="addDirectoryvalue">
          <label for="idDirectoryvalue">№:</label>
          <input id="idDirectoryvalue" v-model="newDirectoryvalue.idDirectoryvalue" type="text" required>

          <!-- <label for="idDirectory">Справочник:</label>
          <input id="idDirectory" v-model="newDirectoryvalue.idDirectory" type="text" required> -->

          <!-- <label for="idDirectory">Справочник:</label>
          <select id="idDirectory" v-model="newDirectoryvalue.idDirectory" required>
            <option value="">Выберите справочник</option>
            <option v-for="dir in directoryvalues" :key="dir.idDirectory" :value="dir.idDirectory">
              {{ dir.DirectoryName && dir.DirectoryName.length > 0? dir.DirectoryName[0].nameDirectory : '' }}
            </option>
          </select> -->

          <label for="idDirectory">Справочник:</label>
          <select id="idDirectory" v-model="newDirectoryvalue.idDirectory" required class="full-width-select">
            <option value="">Выберите справочник</option>
            <option v-for="id in uniqueIdDirectories" :key="id" :value="id">
            {{ findDirectoryNameById(id) }}
            </option>
          </select>

          <label for="longName">Длинное название:</label>
      <input id="longName" v-model="newDirectoryvalue.longName" type="text" required>

      <label for="shortName">Короткое название:</label>
      <input id="shortName" v-model="newDirectoryvalue.shortName" type="text" required>

      <label for="momentBegin">Момент начала:</label>
      <input id="momentBegin" v-model="newDirectoryvalue.momentBegin" type="text" required>

      <label for="momentEnd">Момент конца:</label>
      <input id="momentEnd" v-model="newDirectoryvalue.momentEnd" type="text" required>
      <button type="submit">Добавить</button>
      </form>
    </div>
  </div>
</div>
</div>
 </div>
 </template>

<style>
.full-width-select {
    width: 100%;
    min-height: 35px;
}
</style>