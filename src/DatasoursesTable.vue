<script setup>

import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag';
import { parseISO, format } from 'date-fns';
import { ref, reactive, computed, watchEffect } from 'vue';

// const totalItems = computed(() => datasourses.value.length); // Общее количество элементов в таблице
// const displayedItems = computed(() => paginatedDatasourses.value.length); // Количество отображаемых элементов
// const filteredItems = computed(() => sortedDatasourses.value.length); // Количество отфильтрованных элементов

// const itemsPerPage = 14; // Количество элементов на странице
// const currentPage = ref(1); // Текущая страница
// const totalPages = computed(() => Math.ceil(datasourses.value.length / itemsPerPage)); // Общее количество страниц

// function previousPage() {
//  if (currentPage.value > 1) {
//     currentPage.value--;
//  }
// }

// function nextPage() {
//  if (currentPage.value < totalPages.value) {
//     currentPage.value++;
//  }
// }

// const paginatedDatasourses = computed(() => {
//  const start = (currentPage.value - 1) * itemsPerPage;
//  const end = start + itemsPerPage;
//  return sortedDatasourses.value.slice(start, end);
// });

const props = defineProps({
 parameter: Object,
});

const showFilter = ref(false); // Инициализация переменной showFilter как false
const toggleFilter = () => {
      showFilter.value = !showFilter.value; // Переключение значения showFilter при каждом нажатии на кнопку
    };

// Добавление состояния для фильтрации и сортировки
// const filterParameter = ref('');
// const filterDataSourse = ref('');
// const filterDataSourseKey = ref('');
const sortField = ref(''); // Поле для сортировки по умолчанию
const sortDirection = ref('asc'); // Направление сортировки по умолчанию


const sortedDatasourses = computed(() => {
 return [...datasourses.value].sort((a, b) => {
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

const displaySettings = reactive({
 showIdParameter: false,
 showIdDataSourse: true,
 showDataSourseKey: true,
 showMomentBegin: false,
 showMomentEnd: false,
});

function formatDateTime(dateTimeString) {
 const date = parseISO(dateTimeString);
 return format(date, "yyyy-MM-dd HH:mm:ss.SSS");
}

const showModal__ = ref(false);
function openModal_() {
      showModal__.value = true;
    }

const ALL_DATASOURSES_QUERY = gql`
query MyQuery($dataSourseKey: String, $idDataSourse: [Int!], $idParameter: [Int!], $momentBegin: DateTime, $momentEnd: DateTime) {
 ParameterDataSourses(dataSourseKey: $dataSourseKey, idDataSourse: $idDataSourse, idParameter: $idParameter, momentBegin: $momentBegin, momentEnd: $momentEnd) {
    idParameterdatasourse
    idDataSourse
    idParameter
    dataSourseKey
    momentBegin
    momentEnd
    ParameterName {
      nameParameter
    }
    Istochnik {
      longName
    }
  }
}
`;

const dataSourseKey = ref(null);
const idDataSourse = ref(null);
const idParameter = ref(null);
const momentBegin = ref(null);
const momentEnd = ref(null);

const { result: resultDatasourse } = useQuery(ALL_DATASOURSES_QUERY, () => {
      // Определение параметров запроса
      let queryParameters = {
        dataSourseKey: dataSourseKey.value,
        idDataSourse: idDataSourse.value,
        momentBegin: momentBegin.value,
        momentEnd: momentEnd.value,
      };

      // Проверка наличия props и props.parameter и добавление idParameter, если они определены
      if (props && props.parameter) {
        queryParameters.idParameter = props.parameter.idParameter;
      }

      return queryParameters;
    });

// Функция для сброса фильтров
const resetFilters = () => {
 dataSourseKey.value = null;
 idDataSourse.value = null;
 idParameter.value = null;
 momentBegin.value = null;
 momentEnd.value = null;
};

const datasourses = computed(() => resultDatasourse.value?.ParameterDataSourses ?? [])

watchEffect(() => {
 console.log(datasourses.value);
});

function getUniqueValues(array, key) {
 return [...new Set(array.map(item => item[key]))];
}

const uniqueIdParameters = computed(() => getUniqueValues(datasourses.value, 'idParameter'));
const uniqueIdDataSources = computed(() => getUniqueValues(datasourses.value, 'idDataSourse'));
const uniqueDataSourseKeys = computed(() => getUniqueValues(datasourses.value, 'dataSourseKey'));
const uniqueMomentBegins = computed(() => getUniqueValues(datasourses.value, 'momentBegin'));
const uniqueMomentEnds = computed(() => getUniqueValues(datasourses.value, 'momentEnd'));


const DELETE_DATASOURSE_MUTATION = gql`
mutation deleteParameterdatasourse($parameterdatasourseId: Int!) {
 deleteParameterdatasourse(parameterdatasourseId: $parameterdatasourseId)
}
`;
const { mutate: deleteParameterdatasourse } = useMutation(DELETE_DATASOURSE_MUTATION, {
 refetchQueries: [{ query: ALL_DATASOURSES_QUERY }],
});
// Функция для удаления параметра с подтверждением
const deleteDatasourseWithConfirm = (parameterdatasourseId) => {
 if (window.confirm('Вы уверены, что хотите удалить этот источник данных параметров?')) {
    deleteParameterdatasourse({ parameterdatasourseId })
      .then(() => {
        // window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при удалении:', error);
      });
 }
};

const UPDATE_DATASOURSE_MUTATION = gql`
mutation updateParameterdatasourse( $parameterdatasourseData: ParameterDataSourseInput!, $parameterdatasourseId: Int!) {
 updateParameterdatasourse(parameterdatasourseData: $parameterdatasourseData, parameterdatasourseId: $parameterdatasourseId) 
}
`;
const { mutate: updateParameterdatasourse } = useMutation(UPDATE_DATASOURSE_MUTATION, {
 refetchQueries: [{ query: ALL_DATASOURSES_QUERY }],
});
const showModal_ds = ref(false);
const editingParameterdatasourseId = ref(null);
const newParameterdatasourseData = reactive({
 idParameter: '',
 idDataSourse:'',
 dataSourseKey:'',
 momentBegin:'',
 momentEnd:''
});

const editParameterdatasourse = (parameterdatasourseId) => {
 const datasourse = datasourses.value.find(p => p.idParameterdatasourse === parameterdatasourseId);
 if (datasourse) {
    editingParameterdatasourseId.value = parameterdatasourseId;
    newParameterdatasourseData.idParameterdatasourse = datasourse.idParameterdatasourse; 
    newParameterdatasourseData.idParameter = datasourse.idParameter;
    newParameterdatasourseData.idDataSourse = datasourse.idDataSourse;
    newParameterdatasourseData.dataSourseKey = datasourse.dataSourseKey;
    newParameterdatasourseData.momentBegin = datasourse.momentBegin;
    newParameterdatasourseData.momentEnd = datasourse.momentEnd;
    showModal_ds.value = true;
 }
};

const UpdateParameterDatasourseWithConfirm = () => {
 if (window.confirm('Вы уверены, что хотите сохранить изменения?')) {
    newParameterdatasourseData.idParameter = parseInt(newParameterdatasourseData.idParameter, 10);
    newParameterdatasourseData.idDataSourse = parseInt(newParameterdatasourseData.idDataSourse, 10);
    updateParameterdatasourse({ parameterdatasourseId: editingParameterdatasourseId.value, parameterdatasourseData: newParameterdatasourseData })
      .then(() => {
        editingParameterdatasourseId.value = null; // Сбросить ID редактируемого параметра
        showModal_ds.value = false;
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при обновлении:', error);
      });
 }
};

const CREATE_DATASOURSE_MUTATION = gql`
mutation createParameterdatasourse($parameterdatasourseData: ParameterDataSourseInput!) {
 createParameterdatasourse(parameterdatasourseData: $parameterdatasourseData) {
    idParameterdatasourse
    idParameter
    idDataSourse
    dataSourseKey
    momentBegin
    momentEnd
 }
}
`;

const showModal_ds_ = ref(false);
    const newParameterdatasourse = ref({
      idParameterdatasourse: '',
      idParameter: '',
      idDataSourse: '',
      dataSourseKey: '',
      momentBegin: '',
      momentEnd: '',
    });

    const { mutate: createParameterdatasourse } = useMutation(CREATE_DATASOURSE_MUTATION, {
      refetchQueries: [{ query: ALL_DATASOURSES_QUERY }],
    });

    function openModal() {
      showModal_ds_.value = true;
    }

    function addParameterdatasourse() {
      const parameterdatasourseData = {
    ...newParameterdatasourse.value,
    idParameterdatasourse:parseInt(newParameterdatasourse.value.idParameterdatasourse,10),
    idParameter:parseInt(newParameterdatasourse.value.idParameter, 10),
    idDataSourse: parseInt(newParameterdatasourse.value.idDataSourse, 10),
 };
      createParameterdatasourse({ parameterdatasourseData})
        .then(() => {
          showModal_ds_.value = false;
        })
        .catch((error) => {
          console.error('Ошибка при создании нового параметра:', error);
        });
};

</script>

<template> 
  <div>
</div>
<div class="container_">
  <div>
  <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th colspan="8">
              <div class="header-container" style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="margin-left: 5px;">Источники данных параметров</h2>
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
                    <input type="checkbox" v-model="displaySettings.showIdParameter">
                    Параметр
                </label>
                <label>
                    <input type="checkbox" v-model="displaySettings.showIdDataSourse">
                    Источник данных
                </label>
                <label>
                    <input type="checkbox" v-model="displaySettings.showDataSourseKey">
                    Источник данных ключ
                </label>
                <label>
                 <input type="checkbox" v-model="displaySettings.showMomentBegin">
                 Момент начала
              </label>
              <label>
                 <input type="checkbox" v-model="displaySettings.showMomentEnd">
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
                  <select v-model="idParameter">
                    <option v-for="id in uniqueIdParameters" :key="id" :value="id">
                      {{ id }}
                    </option>
                  </select>
                  <select v-model="idDataSourse">
                    <option v-for="id in uniqueIdDataSources" :key="id" :value="id">
                      {{ id }}
                    </option>
                  </select>
                  <select v-model="dataSourseKey">
                    <option v-for="key in uniqueDataSourseKeys" :key="key" :value="key">
                      {{ key }}
                    </option>
                  </select>
                  <select v-model="momentBegin" v-if="displaySettings.showMomentBegin">
                    <option v-for="date in uniqueMomentBegins" :key="date" :value="date">
                      {{ date }}
                    </option>
                  </select>
                  <select v-model="momentEnd" v-if="displaySettings.showMomentEnd">
                    <option v-for="date in uniqueMomentEnds" :key="date" :value="date">
                      {{ date }}
                    </option>
                  </select>
                <button @click="resetFilters">Сбросить фильтры</button>
              </td>
          </tr>
          <!-- <td colspan="8">
          <input class="filter-input_" v-model="filterParameter" placeholder="Фильтр по параметру" />
          <input class="filter-input_" v-model="filterDataSourse" placeholder="Фильтр по источнику данных" />
          <input class="filter-input_" v-model="filterDataSourseKey" placeholder="Фильтр по ключу источника данных" />
        </td> -->
          <tr>
            <th v-if="displaySettings.showIdParameter" @click="sort('idParameter')">Параметр  <span v-if="sortField === 'idParameter'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
            <th v-if="displaySettings.showIdDataSourse" @click="sort('idDataSourse')">Источник данных <span v-if="sortField === 'idDataSourse'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
            <th v-if="displaySettings.showDataSourseKey" @click="sort('dataSourseKey')">Источник данных ключ <span v-if="sortField === 'dataSourseKey'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
            <th v-if="displaySettings.showMomentBegin">Момент начала</th>
            <th v-if="displaySettings.showMomentEnd">Момент конца</th>
            <th>Действия</th>
            </tr>
           </thead>
           <tbody v-if="sortedDatasourses.length">
           <tr v-for="datasourse in sortedDatasourses" :key="datasourse.idParameterdatasourse">
                <td v-if="displaySettings.showIdParameter">{{ datasourse.ParameterName[0].nameParameter}}</td>
                <td v-if="displaySettings.showIdDataSourse">{{ datasourse.Istochnik[0].longName }}</td>
                <td v-if="displaySettings.showDataSourseKey">{{ datasourse.dataSourseKey }}</td>
                <td v-if="displaySettings.showMomentBegin">{{ formatDateTime(datasourse.momentBegin) }}</td>
                <td v-if="displaySettings.showMomentEnd">{{ formatDateTime(datasourse.momentEnd) }}</td>
               <td>
                <button @click="deleteDatasourseWithConfirm(datasourse.idParameterdatasourse)" class="btn btn-danger btn-small"><i class="material-icons">delete</i></button>
                <button @click="editParameterdatasourse(datasourse.idParameterdatasourse)" class="btn btn-primary btn-small"><i class="material-icons">edit</i></button>
               </td>
             </tr>
           </tbody>
         </table>
         <!-- <div class="pagination" style="width:100%;">
        <div>
        <span style="margin-right: 10px;">Всего элементов: {{ totalItems }}</span>
        <span style="margin-right: 10px;">Отображаемых элементов: {{ displayedItems }}</span>
        <span style="margin-right: 10px;" v-if="showFilter">Отфильтрованных элементов: {{ filteredItems }}</span>
        <button class="btn btn-secondary" style="margin-right: 10px;" @click="previousPage">Предыдущая</button>
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        <button class="btn btn-secondary" style="margin-left: 10px;" @click="nextPage">Следующая</button>
        </div>
        </div> -->
         <div v-if="showModal_ds" class="modal">
 <div class="modal-content">
  <span class="close" @click="showModal_ds= false">&times;</span>
      <form @submit.prevent="UpdateParameterDatasourseWithConfirm">
        <label for="idParameter">Параметер:</label> 
        <input v-model="newParameterdatasourseData.idParameter" placeholder="Параметер">

        <label for="idDataSourse">Источник данных:</label>
        <input v-model="newParameterdatasourseData.idDataSourse" placeholder="Источник данных">

        <label for="dataSourseKey">Источник данных ключ:</label>
        <input v-model="newParameterdatasourseData.dataSourseKey" placeholder="мин уставка">
        <label for="momentBegin">Момент начала:</label> 
        <input v-model="newParameterdatasourseData.momentBegin" placeholder="моментначала">
        <label for="momentEnd">Момент конца:</label> 
        <input v-model="newParameterdatasourseData.momentEnd" placeholder="моментконца">
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
 </div>
    <div style="overflow: hidden;">
    <div v-if="showModal_ds_" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal_ds_ = false">&times;</span>
      <form @submit.prevent="addParameterdatasourse">
          <label for="idParameterdatasourse">№:</label>
          <input id="idParameterdatasourse" v-model="newParameterdatasourse.idParameterdatasourse" type="text" required>

          <label for="idParameter">Параметр:</label>
          <input id="idParameter" v-model="newParameterdatasourse.idParameter" type="text" required>

          <label for="idDataSourse">Источник данных:</label>
          <input id="idDataSourse" v-model="newParameterdatasourse.idDataSourse" type="text" required>

          <label for="dataSourseKey">Источник данных ключ:</label>
          <input id="dataSourseKey" v-model="newParameterdatasourse.dataSourseKey" type="text" required>

          <label for="momentBegin">Момент начала:</label>
          <input id="momentBegin" v-model="newParameterdatasourse.momentBegin" type="text" required>

          <label for="momentEnd">Момент конца:</label>
          <input id="momentEnd" v-model="newParameterdatasourse.momentEnd" type="text" required>
        <button type="submit">Добавить</button>
      </form>
    </div>
  </div>
  </div>
 </div>
 </div>
 </template>
 
 <style>
 .filter-input_ {
  margin-right: 5px; 
 }
 </style>