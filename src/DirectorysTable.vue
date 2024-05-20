<script setup>

import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag';
import { parseISO, format } from 'date-fns';
import { ref, reactive, computed, watchEffect } from 'vue';

import DirectoryValues from './DirectoryvaluesTable.vue';

const selectedDirectory = ref(null);

const selectDirectory = (idDirectory) => {
selectedDirectory.value = idDirectory;
};

const itemsPerPage = 13; // Количество элементов на странице
const currentPage = ref(1); // Текущая страница
const totalPages = computed(() => Math.ceil(directorys.value.length / itemsPerPage)); // Общее количество страниц

function previousPage() {
 if (currentPage.value > 1) {
    currentPage.value--;
 }
}

function nextPage() {
 if (currentPage.value < totalPages.value) {
    currentPage.value++;
 }
}

const paginatedDirectories = computed(() => {
 const start = (currentPage.value - 1) * itemsPerPage;
 const end = start + itemsPerPage;
 return sortedDirectorys.value.slice(start, end);
});

function getUniqueValues(array, key) {
 return [...new Set(array.map(item => item[key]))];
}

const uniqueNameDirectories = computed(() => getUniqueValues(directorys.value, 'nameDirectory'));
const uniqueMomentBegins = computed(() => getUniqueValues(directorys.value, 'momentBegin'));
const uniqueMomentEnds = computed(() => getUniqueValues(directorys.value, 'momentEnd'));

function formatDateTime(dateTimeString) {
 const date = parseISO(dateTimeString);
 return format(date, "yyyy-MM-dd HH:mm:ss.SSS");
}

const showFilter = ref(false); // Инициализация переменной showFilter как false
const toggleFilter = () => {
      showFilter.value = !showFilter.value; // Переключение значения showFilter при каждом нажатии на кнопку
    };

// const filter = ref('');
const sortField = ref(''); // Поле для сортировки по умолчанию
const sortDirection = ref('asc'); // Направление сортировки по умолчанию

const sortedDirectorys = computed(() => {
 return [...directorys.value].sort((a, b) => {
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
 showName: true,
 showMomentBegin: false,
 showMomentEnd: false,
});

const showModal__ = ref(false);
function openModal_() {
  showModal__.value = true;
}

// const filteredDirectorys = computed(() => {
//  if (!filter.value) {
//     return sortedDirectorys.value;
//  }
//  const lowerCaseFilter = filter.value.toLowerCase();
//  return sortedDirectorys.value.filter(directory =>
//     directory.nameDirectory.toLowerCase().includes(lowerCaseFilter)
//  );
// });


const ALL_DIRECTORYS_QUERY = gql`
query MyQuery($nameDirectory: String, $momentBegin: DateTime, $momentEnd: DateTime) {
 Directorys(nameDirectory: $nameDirectory, momentBegin: $momentBegin, momentEnd: $momentEnd) {
    idDirectory
    nameDirectory
    momentBegin
    momentEnd
 }
}
`;

const nameDirectory = ref(''); //ref для хранения значения фильтра
const momentBegin = ref(null); // ref для хранения значения начала
const momentEnd = ref(null); // ref для хранения значения конца

const { result: result_directory } = useQuery(ALL_DIRECTORYS_QUERY, () => ({
 nameDirectory: nameDirectory.value,
 momentBegin: momentBegin.value,
 momentEnd: momentEnd.value,
}));

// Функция для сброса фильтров
const resetFilters = () => {
 nameDirectory.value = '';
 momentBegin.value = null;
 momentEnd.value = null;
};

const directorys = computed(() => result_directory.value?.Directorys ?? []);

watchEffect(() => {
 console.log(directorys.value);
});

const DELETE_DIRECTORY_MUTATION = gql`
mutation deleteDirectory($directoryId: Int!) {
 deleteDirectory(directoryId: $directoryId)
}
`;
const { mutate: deleteDirectory } = useMutation(DELETE_DIRECTORY_MUTATION, {
 refetchQueries: [{ query: ALL_DIRECTORYS_QUERY }],
});
// Функция для удаления параметра с подтверждением
const deleteDirectoryWithConfirm = (directoryId) => {
 if (window.confirm('Вы уверены, что хотите удалить этот справочник?')) {
    deleteDirectory({ directoryId })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при удалении:', error);
      });
 }
};

const UPDATE_DIRECTORY_MUTATION = gql`
mutation updateDirectory( $directoryData: DirectoryInput!, $directoryId: Int!) {
 updateDirectory(directoryData: $directoryData, directoryId: $directoryId) 
}
`;
const { mutate: updateDirectory } = useMutation(UPDATE_DIRECTORY_MUTATION, {
 refetchQueries: [{ query: ALL_DIRECTORYS_QUERY }],
});
const showModal_directory = ref(false);
const editingDirectoryId = ref(null);
const newDirectoryData = reactive({
 nameDirectory: '',
 momentBegin:'',
 momentEnd:''
});

const editingDirectory = (directoryId) => {
 const directory = directorys.value.find(p => p.idDirectory === directoryId);
 if (directory) {
    editingDirectoryId.value = directoryId;
    newDirectoryData.idDirectory = directory.idDirectory; 
    newDirectoryData.nameDirectory = directory.nameDirectory;
    newDirectoryData.momentBegin = directory.momentBegin;
    newDirectoryData.momentEnd = directory.momentEnd;
    showModal_directory.value = true;
 }
};

const UpdateDirectoryWithConfirm = () => {
 if (window.confirm('Вы уверены, что хотите сохранить изменения?')) {
    updateDirectory({ directoryId: editingDirectoryId.value, directoryData: newDirectoryData })
      .then(() => {
        editingDirectoryId.value = null; // Сбросить ID редактируемого параметра
        showModal_directory.value = false;
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при обновлении:', error);
      });
 }
};

const CREATE_DIRECTORY_MUTATION = gql`
mutation createDirectory($directoryData: DirectoryInput!) {
 createDirectory(directoryData: $directoryData) {
    idDirectory
    nameDirectory
    momentBegin
    momentEnd
 }
}
`;

const showModal_directory_ = ref(false);
    const newDirectory = ref({
      idDirectory: '',
      nameDirectory: '',
      momentBegin: '',
      momentEnd: '',
    });

    const { mutate: createDirectory } = useMutation(CREATE_DIRECTORY_MUTATION, {
      refetchQueries: [{ query: ALL_DIRECTORYS_QUERY }],
    });

    function openModal() {
      showModal_directory_.value = true;
    }

    function addDirectory() {
      const directoryData = {
    ...newDirectory.value,
    idDirectory:parseInt(newDirectory.value.idDirectory, 10)
 };
      createDirectory({ directoryData})
        .then(() => {
          showModal_directory_.value = false;
        })
        .catch((error) => {
          console.error('Ошибка при создании нового параметра:', error);
        });
};

</script>

<template>
<div v-if="showModal_directory_" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal_directory_ = false">&times;</span>
      <form @submit.prevent="addDirectory">
          <label for="idDirectory">№:</label>
          <input id="idDirectory" v-model="newDirectory.idDirectory" type="text" required>

          <label for="nameDirectory">Название справочника:</label>
          <input id="nameDirectory" v-model="newDirectory.nameDirectory" type="text" required>

          <label for="momentBegin">Момент начала:</label>
          <input id="momentBegin" v-model="newDirectory.momentBegin" type="text" required>

          <label for="momentEnd">Момент конца:</label>
          <input id="momentEnd" v-model="newDirectory.momentEnd" type="text" required>
        <button type="submit">Добавить</button>
      </form>
    </div>
  </div>
<div class="container">
<div class="left-panel">
  <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th colspan="4">
              <div class="header-container" style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="margin-left: 5px;">Справочники</h2>
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
                    <input type="checkbox" v-model="displaySettingsDirectory.showName">
                    Название справочника
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
              <td colspan="4">
                <select v-model="nameDirectory">
                  <option value="">Выберите название справочника</option>
                  <option v-for="directory in uniqueNameDirectories" :key="directory" :value="directory">
                      {{ directory }}
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
          <tr>
    <th v-if="displaySettingsDirectory.showName" @click="sort('nameDirectory')">
      Название справочника 
      <span v-if="sortField === 'nameDirectory'">{{ sortDirection === 'asc' ? '▼' : '▲' }}</span>
    </th>
    <th v-if="displaySettingsDirectory.showMomentBegin">Момент начала</th>
   <th v-if="displaySettingsDirectory.showMomentEnd">Момент конца</th>
    <th>Действия</th>
 </tr>
</thead>
<tbody v-if="sortedDirectorys.length">
 <tr v-for="directory in paginatedDirectories" :key="directory.idDirectory" @click="selectDirectory(directory.idDirectory)">
    <td v-if="displaySettingsDirectory.showName">{{ directory.nameDirectory }}</td>
    <td v-if="displaySettingsDirectory.showMomentBegin">{{ formatDateTime(directory.momentBegin) }}</td>
    <td v-if="displaySettingsDirectory.showMomentEnd">{{ formatDateTime(directory.momentEnd) }}</td>
               <td>
                <button @click="deleteDirectoryWithConfirm(directory.idDirectory)" class="btn btn-danger btn-small"><i class="material-icons">delete</i></button>
                <button @click="editingDirectory(directory.idDirectory)" class="btn btn-primary btn-small"><i class="material-icons">edit</i></button>
               </td>
             </tr>
           </tbody>
         </table>
         <div class="pagination d-flex justify-content-start align-items-end">
        <button class="btn btn-secondary" style="margin-right: 10px;" @click="previousPage">Предыдущая</button>
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        <button class="btn btn-secondary" style="margin-left: 10px;" @click="nextPage">Следующая</button>
        </div>
        </div>
         <div class="right-panel">
          <DirectoryValues :directory="selectedDirectory"/>
          </div> 
          </div>
         <div v-if="showModal_directory" class="modal">
    <div class="modal-content">
      <span class="close" @click="showModal_directory= false">&times;</span>
      <form @submit.prevent="UpdateDirectoryWithConfirm">
        <label for="nameDirectory">Название справочника:</label> 
        <input v-model="newDirectoryData.nameDirectory" placeholder="Название справочника">
        <label for="momentBegin">Момент начала:</label> 
        <input v-model="newDirectoryData.momentBegin" placeholder="моментначала">
        <label for="momentEnd">Момент конца:</label> 
        <input v-model="newDirectoryData.momentEnd" placeholder="моментконца">
        <button type="submit">Сохранить изменения</button>
      </form>
     </div>
 </div>
 </template>

 <style>

 .pagination {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #ddd;; /* цвет фона*/
    padding: 10px 0;
}
 </style>