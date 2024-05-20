<script setup>

import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag';
import { parseISO, format } from 'date-fns';
import { ref, reactive, computed, watchEffect} from 'vue';

import ParameterLimits from './LimitsTable.vue';
import  ParameterDataSourses from './DatasoursesTable.vue';

const totalItems = computed(() => parameters.value.length); // Общее количество элементов в таблице
const displayedItems = computed(() => paginatedParameters.value.length); // Количество отображаемых элементов
const filteredItems = computed(() => sortedParameters.value.length); // Количество отфильтрованных элементов

const itemsPerPage = 14; // Количество элементов на странице
const currentPage = ref(1); // Текущая страница
const totalPages = computed(() => Math.ceil(parameters.value.length / itemsPerPage)); // Общее количество страниц

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

const paginatedParameters = computed(() => {
 const start = (currentPage.value - 1) * itemsPerPage;
 const end = start + itemsPerPage;
 return sortedParameters.value.slice(start, end);
});


const showFilter = ref(false); // Инициализация переменной showFilter как false
const toggleFilter = () => {
      showFilter.value = !showFilter.value; // Переключение значения showFilter при каждом нажатии на кнопку
    };

const sortField = ref(''); // Поле для сортировки по умолчанию
const sortDirection = ref('asc'); // Направление сортировки по умолчанию
// const filterIdParameter = ref(''); // Поле для фильтрации по ID параметра
// const filternameParameter = ref(''); 
// const filterIdPhysicalType = ref(''); // Поле для фильтрации по ID физического типа
// const filterIdPlaceIzmer = ref(''); // Поле для фильтрации по ID места измерения
// const filterIdSredaIzmer = ref(''); // Поле для фильтрации по ID среды измерения
// const filterIdUnits = ref(''); // Поле для фильтрации по ID единиц измерения

// const filteredParameters = computed(() => {
//  return sortedParameters.value.filter(parameter => {
//     const idParameterMatches = !filterIdParameter.value || parameter.idParameter.toString().includes(filterIdParameter.value);
//     const nameParameterMatches = !filternameParameter.value || parameter.nameParameter.toString().includes(filternameParameter.value);
//     const idPhysicalTypeMatches = !filterIdPhysicalType.value || parameter.idPhysicalType.toString().includes(filterIdPhysicalType.value);
//     const idPlaceIzmerMatches = !filterIdPlaceIzmer.value || parameter.idPlaceIzmer.toString().includes(filterIdPlaceIzmer.value);
//     const idSredaIzmerMatches = !filterIdSredaIzmer.value || parameter.idSredaIzmer.toString().includes(filterIdSredaIzmer.value);
//     const idUnitsMatches = !filterIdUnits.value || parameter.idUnits.toString().includes(filterIdUnits.value);
//     return idParameterMatches && nameParameterMatches && idPhysicalTypeMatches && idPlaceIzmerMatches && idSredaIzmerMatches && idUnitsMatches;
//  });
// });


const sortedParameters = computed(() => {
 return [...parameters.value].sort((a, b) => {
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
 showIdParameter: true,
 showNameParameter: true,
 showIdPhysicalType: true,
 showIdPlaceIzmer: true,
 showIdSredaIzmer: true,
 showIdUnits: true,
 showMomentBegin: false,
 showMomentEnd: false,
});
const showModal__ = ref(false);
function openModal_() {
      showModal__.value = true;
    }

const showSplitter = computed(() => selectedParameter.value !== null);

const selectedParameter = ref(null);
const selectParameter = (parameter) => {
 selectedParameter.value = parameter;
};

function formatDateTime(dateTimeString) {
 const date = parseISO(dateTimeString);
 return format(date, "yyyy-MM-dd HH:mm:ss.SSS");
}

const ALL_PARAMETERS_QUERY = gql`
query MyQuery($idParameter: [Int!], $idPhysicalType: [Int!], $idPlaceIzmer: [Int!], $idSredaIzmer: [Int!], $idUnits: [Int!], $nameParameter: String, $momentBegin: DateTime, $momentEnd: DateTime) {
  Parameters(idParameter: $idParameter, idPhysicalType: $idPhysicalType, idPlaceIzmer: $idPlaceIzmer, idSredaIzmer: $idSredaIzmer, idUnits: $idUnits, nameParameter: $nameParameter, momentBegin: $momentBegin, momentEnd: $momentEnd) {
    idParameter
    idPhysicalType
    idPlaceIzmer
    idSredaIzmer
    idUnits
    momentBegin
    momentEnd
    nameParameter
    PhysicalType {
      longName
    }
    PlaceIzmer {
      longName
    }
    SredaIzmer {
      longName
    }
    Units {
      longName
    }
  }
}
`;

const idParameter = ref([]);
const idPhysicalType = ref([]);
const idPlaceIzmer = ref([]);
const idSredaIzmer = ref([]);
const idUnits = ref([]);
const nameParameter = ref('');
const momentBegin = ref(null);
const momentEnd = ref(null);


const {result} = useQuery(ALL_PARAMETERS_QUERY, () => ({
 idParameter: idParameter.value,
 idPhysicalType: idPhysicalType.value,
 idPlaceIzmer: idPlaceIzmer.value,
 idSredaIzmer: idSredaIzmer.value,
 idUnits: idUnits.value,
 nameParameter: nameParameter.value,
 momentBegin: momentBegin.value,
 momentEnd: momentEnd.value
}));

const resetFilters = () => {
  idParameter.value = [];
  idPhysicalType.value = [];
  idPlaceIzmer.value = [];
  idSredaIzmer.value = [];
  idUnits.value = [];
  nameParameter.value = '';
  momentBegin.value = null;
  momentEnd.value = null;
};

const parameters = computed(() => result.value?.Parameters ?? [])

watchEffect(() => {
 console.log(parameters.value);
});

function getUniqueValues(array, key) {
 return [...new Set(array.map(item => item[key]))];
}

const uniqueIdParameters = computed(() => getUniqueValues(parameters.value, 'idParameter'));
const uniqueNameParameters = computed(() => getUniqueValues(parameters.value, 'nameParameter'));
const uniqueIdPhysicalTypes = computed(() => getUniqueValues(parameters.value, 'idPhysicalType'));
const uniqueIdPlaceIzmers = computed(() => getUniqueValues(parameters.value, 'idPlaceIzmer'));
const uniqueIdSredaIzmers = computed(() => getUniqueValues(parameters.value, 'idSredaIzmer'));
const uniqueIdUnits = computed(() => getUniqueValues(parameters.value, 'idUnits'));
const uniqueMomentBegins = computed(() => getUniqueValues(parameters.value, 'momentBegin'));
const uniqueMomentEnds = computed(() => getUniqueValues(parameters.value, 'momentEnd'));


const DELETE_PARAMETER_MUTATION = gql`
mutation deleteParameter($parameterId: Int!) {
 deleteParameter(parameterId: $parameterId)
}
`;
const { mutate: deleteParameter } = useMutation(DELETE_PARAMETER_MUTATION, {
 refetchQueries: [{ query: ALL_PARAMETERS_QUERY }],
});
// Функция для удаления параметра с подтверждением
const deleteParameterWithConfirm = (parameterId) => {
 if (window.confirm('Вы уверены, что хотите удалить этот параметр?')) {
    deleteParameter({ parameterId })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при удалении:', error);
      });
 }
};

const UPDATE_PARAMETER_MUTATION = gql`
mutation updateParameter( $parameterData: ParameterInput!, $parameterId: Int!) {
 updateParameter(parameterData: $parameterData, parameterId: $parameterId) 
}
`;
const { mutate: updateParameter } = useMutation(UPDATE_PARAMETER_MUTATION, {
 refetchQueries: [{ query: ALL_PARAMETERS_QUERY }],
});
const showModal_ = ref(false);
const editingParameterId = ref(null);
const newParameterData = reactive({
 nameParameter: '',
 idPhysicalType: '',
 idPlaceIzmer:'',
 idSredaIzmer:'',
 idUnits:'',
 momentBegin:'',
 momentEnd:''
});

const editParameter = (parameterId) => {
 const parameter = parameters.value.find(p => p.idParameter === parameterId);
 if (parameter) {
    editingParameterId.value = parameterId;
    newParameterData.idParameter = parameter.idParameter;
    newParameterData.nameParameter = parameter.nameParameter;
    newParameterData.idPhysicalType = parameter.idPhysicalType;
    newParameterData.idPlaceIzmer = parameter.idPlaceIzmer;
    newParameterData.idSredaIzmer = parameter.idSredaIzmer;
    newParameterData.idUnits = parameter.idUnits;
    newParameterData.momentBegin = parameter.momentBegin;
    newParameterData.momentEnd = parameter.momentEnd;
    showModal_.value = true;
 }
};

const UpdateParameterWithConfirm = () => {
 if (window.confirm('Вы уверены, что хотите сохранить изменения?')) {
    newParameterData.idPhysicalType = parseInt(newParameterData.idPhysicalType, 10);
    newParameterData. idPlaceIzmer = parseInt(newParameterData.idPlaceIzmer, 10);
    newParameterData.idSredaIzmer = parseInt(newParameterData.idSredaIzmer, 10);
    newParameterData.idUnits = parseInt(newParameterData.idUnits, 10);
    updateParameter({ parameterId: editingParameterId.value, parameterData: newParameterData })
      .then(() => {
        editingParameterId.value = null; // Сбросить ID редактируемого параметра
        showModal_.value = false;
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при обновлении:', error);
      });
 }
};

const CREATE_PARAMETER_MUTATION = gql`
mutation createParameter($parameterData: ParameterInput!) {
 createParameter(parameterData: $parameterData) {
    idParameter
    idPhysicalType
    idPlaceIzmer
    idSredaIzmer
    idUnits
    momentBegin
    momentEnd
    nameParameter
 }
}
`;

const showModal = ref(false);
    const newParameter = ref({
      idParameter: '',
      nameParameter: '',
      idPhysicalType: '',
      idPlaceIzmer: '',
      idSredaIzmer: '',
      idUnits: '',
      momentBegin: '',
      momentEnd: '',
    });

    const { mutate: createParameter } = useMutation(CREATE_PARAMETER_MUTATION, {
      refetchQueries: [{ query: ALL_PARAMETERS_QUERY }],
    });

    function openModal() {
      showModal.value = true;
    }

    function addParameter() {
      const parameterData = {
    ...newParameter.value,
    idParameter:parseInt(newParameter.value.idParameter,10),
    idPhysicalType: parseInt(newParameter.value.idPhysicalType, 10),
    idPlaceIzmer: parseInt(newParameter.value.idPlaceIzmer, 10),
    idSredaIzmer: parseInt(newParameter.value.idSredaIzmer, 10),
    idUnits: parseInt(newParameter.value.idUnits, 10),
 };
      createParameter({ parameterData})
        .then(() => {
          showModal.value = false;
        })
        .catch((error) => {
          console.error('Ошибка при создании нового параметра:', error);
        });
};
</script>

<template>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal = false">&times;</span>
          <form @submit.prevent="addParameter">
          <label for="idParameter">№:</label>
          <input id="idParameter" v-model="newParameter.idParameter" type="text" required>

          <label for="nameParameter">Название параметра:</label>
          <input id="nameParameter" v-model="newParameter.nameParameter" type="text" required>

          <label for="idPhysicalType">Физ. тип:</label>
          <input id="idPhysicalType" v-model="newParameter.idPhysicalType" type="text" required>

          <label for="idPlaceIzmer">Место измер.:</label>
          <input id="idPlaceIzmer" v-model="newParameter.idPlaceIzmer" type="text" required>

          <label for="idSredaIzmer">Среда измер.:</label>
          <input id="idSredaIzmer" v-model="newParameter.idSredaIzmer" type="text" required>

          <label for="idUnits">Ед. измер.:</label>
          <input id="idUnits" v-model="newParameter.idUnits" type="text" required>

          <label for="momentBegin">Момент начала:</label>
          <input id="momentBegin" v-model="newParameter.momentBegin" type="text" required>

          <label for="momentEnd">Момент конца:</label>
          <input id="momentEnd" v-model="newParameter.momentEnd" type="text" required>
        <button type="submit">Добавить</button>
      </form>
    </div>
  </div>
      <div class="container">
       <div class="left-panel">
         <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th colspan="9">
              <div class="header-container" style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin-left: 5px;">Параметры</h2>
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
                № <input type="checkbox" v-model="displaySettings.showIdParameter">
              </label>
              <label>
                Наименование <input type="checkbox" v-model="displaySettings.showNameParameter">
              </label>
              <label>
                Физ.тип <input type="checkbox" v-model="displaySettings.showIdPhysicalType">
              </label>
              <label>
                Место измер. <input type="checkbox" v-model="displaySettings.showIdPlaceIzmer"> 
              </label>
              <label>
                Среда измер. <input type="checkbox" v-model="displaySettings.showIdSredaIzmer">
              </label>
              <label>
                Ед.измер. <input type="checkbox" v-model="displaySettings.showIdUnits">  
              </label>
              <label>
                Момент начала <input type="checkbox" v-model="displaySettings.showMomentBegin">
              </label>
              <label>
                Момент конца <input type="checkbox" v-model="displaySettings.showMomentEnd">
              </label>
              </div>
                  </div>
                </div>
              </div>
            </th>
          </tr>
          <tr>
          <!-- <td colspan="9">
            <input class="filter" v-model="filterIdParameter" placeholder="Фильтр по №" >
            <input class="filter" v-model="filternameParameter" placeholder="Фильтр по наименованию">
            <input class="filter" v-model="filterIdPhysicalType" placeholder="Фильтр по физ.типу">
            <input class="filter" v-model="filterIdPlaceIzmer" placeholder="Фильтр по месту измер">
            <input class="filter" v-model="filterIdSredaIzmer" placeholder="Фильтр по среде измер."> 
            <input class="filter" v-model="filterIdUnits" placeholder="Фильтр по ед.измер">
          </td> -->
          </tr>
          <tr v-if="showFilter">
    <td colspan="9">
    <select v-model="idParameter">
      <option v-for="id in uniqueIdParameters" :key="id" :value="id">
        {{ id }}
      </option>
    </select>
    <select v-model="nameParameter">
      <option value="">Выберите название параметера</option>
      <option v-for="name in uniqueNameParameters" :key="name" :value="name">
        {{ name }}
      </option>
    </select>
    <select v-model="idPhysicalType">
      <option v-for="type in uniqueIdPhysicalTypes" :key="type" :value="type">
        {{ type }}
                    </option>
                  </select>
                  <select v-model="idPlaceIzmer">
                    <option v-for="place in uniqueIdPlaceIzmers" :key="place" :value="place">
                      {{ place }}
                    </option>
                  </select>
                  <select v-model="idSredaIzmer">
                    <option v-for="sreda in uniqueIdSredaIzmers" :key="sreda" :value="sreda">
                      {{ sreda }}
                    </option>
                  </select>
                  <select v-model="idUnits">
                    <option v-for="unit in uniqueIdUnits" :key="unit" :value="unit">
                      {{ unit }}
                    </option>
                  </select>
                  <select v-model="momentBegin" v-if="displaySettings.showMomentBegin">
                    <option v-for="begin in uniqueMomentBegins" :key="begin" :value="begin">
                      {{ begin }}
                    </option>
                  </select>
                  <select v-model="momentEnd" v-if="displaySettings.showMomentEnd"> 
                    <option v-for="end in uniqueMomentEnds" :key="end" :value="end">
                      {{ end }}
                    </option>
                  </select>
                <button style="margin-left: 5px;" @click="resetFilters">Сбросить фильтры</button>
              </td>
          </tr>
          <tr>
            <th v-if="displaySettings.showIdParameter" @click="sort('idParameter')">
                №
                <span v-if="sortField === 'idParameter'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th v-if="displaySettings.showNameParameter" @click="sort('nameParameter')">
                Наименование
                <span v-if="sortField === 'nameParameter'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th v-if="displaySettings.showIdPhysicalType" @click="sort('idPhysicalType')">
                Физ.тип
                <span v-if="sortField === 'idPhysicalType'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th v-if="displaySettings.showIdPlaceIzmer" @click="sort('idPlaceIzmer')">
                Место измер.
                <span v-if="sortField === 'idPlaceIzmer'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th v-if="displaySettings.showIdSredaIzmer" @click="sort('idSredaIzmer')">
                Среда измер.
                <span v-if="sortField === 'idSredaIzmer'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th v-if="displaySettings.showIdUnits" @click="sort('idUnits')">
                Ед.измер.
                <span v-if="sortField === 'idUnits'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th v-if="displaySettings.showMomentBegin"> Момент начала</th>
            <th v-if="displaySettings.showMomentEnd"> Момент конца</th>
            <th>Действия</th>
            </tr>
           </thead>
           <tbody v-if="sortedParameters.length">
            <tr v-for="parameter in paginatedParameters " :key="parameter.idParameter" @click="selectParameter(parameter)">
            <td v-if="displaySettings.showIdParameter">{{ parameter.idParameter }}</td>
            <td v-if="displaySettings.showNameParameter">{{ parameter.nameParameter }}</td>
            <td v-if="displaySettings.showIdPhysicalType">{{ parameter.PhysicalType [0].longName}}</td>
            <td v-if="displaySettings.showIdPlaceIzmer">{{ parameter.PlaceIzmer [0].longName}} </td>
            <td v-if="displaySettings.showIdSredaIzmer"> {{ parameter.SredaIzmer [0].longName }}</td>
            <td v-if="displaySettings.showIdUnits"> {{ parameter.Units?.[0]?.longName}}</td>
            <td v-if="displaySettings.showMomentBegin">{{ formatDateTime(parameter.momentBegin) }}</td>
            <td v-if="displaySettings.showMomentEnd">{{ formatDateTime(parameter.momentEnd) }}</td>
              <td>
                <button @click="deleteParameterWithConfirm(parameter.idParameter)" class="btn btn-danger btn-small"><i class="material-icons">delete</i></button>
                <button @click="editParameter(parameter.idParameter)" class="btn btn-primary btn-small"><i class="material-icons">edit</i></button>
               </td>
             </tr>
           </tbody>
         </table>
         <div class="pagination" style="width:100%;">
        <div>
        <span style="margin-right: 10px;">Всего элементов: {{ totalItems }}</span>
        <span style="margin-right: 10px;">Отображаемых элементов: {{ displayedItems }}</span>
        <span style="margin-right: 10px;" v-if="showFilter">Отфильтрованных элементов: {{ filteredItems }}</span>
        <button class="btn btn-secondary" style="margin-right: 10px;" @click="previousPage">Предыдущая</button>
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        <button class="btn btn-secondary" style="margin-left: 10px;" @click="nextPage">Следующая</button>
        </div>
        </div>
        </div>
        <div class="right-panel" v-if="showSplitter">
          <ParameterLimits :parameter="selectedParameter"/>
          <ParameterDataSourses :parameter="selectedParameter"/>
        </div>
      </div>
       <div v-if="showModal_" class="modal">
 <div class="modal-content">
  <span class="close" @click="showModal_ = false">&times;</span>
      <form @submit.prevent="UpdateParameterWithConfirm">
        <label for="nameParameter">Название параметра:</label>
        <input v-model="newParameterData.nameParameter" placeholder="Наименование">
        <label for="idPhysicalType">Физ. тип:</label> 
        <input v-model="newParameterData.idPhysicalType" placeholder="ФизТИП">
        <label for="idPlaceIzmer">Место измер.:</label> 
        <input v-model="newParameterData.idPlaceIzmer" placeholder="местоизмер">
        <label for="idSredaIzmer">Среда измер.:</label>
        <input v-model="newParameterData.idSredaIzmer" placeholder="средаизмер">
        <label for="idUnits">Ед. измер.:</label> 
        <input v-model="newParameterData.idUnits" placeholder="единизмер">
        <label for="momentBegin">Момент начала:</label> 
        <input v-model="newParameterData.momentBegin" placeholder="моментначала">
        <label for="momentEnd">Момент конца:</label> 
        <input v-model="newParameterData.momentEnd" placeholder="моментконца">
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
 </div>
 </template>

<style>
.label-container {
 display: flex;
 gap: 10px;
}

.modal-content_ {
 background-color: #fefefe;
 margin: 10% auto; /* 10% от верхней части экрана */
 padding: 10px;
 border: 1px solid #888;
 width: fit-content; /* Ширина содержимого */
 text-align: left; /* Выравнивание текста по левому краю */
}

.filter{
  margin-right: 2px; /* Добавляем отступ справа */
 }
 .container {
 display: flex;
 flex-direction: row;
}

.container table td:last-child {
 width: 70px; /* фиксированная ширина для последней колонки */
}

.left-panel {
 flex: 2;
 /* padding-right: 10px; */
 /* min-width: 100px; */
}

.right-panel {
 flex: 1;
 padding-left: 10px; 
 /* min-width: 100px; */
}

.right-panel table {
 width: 100%;
} 
.left-panel table {
 width: 100%;
}
.splitter {
 width: 10px;
 background: #ccc;
 cursor: col-resize;
 height: 100vh;
 margin-left: 10px; /* Отступ слева */
 margin-right: 10px; /* Отступ справа */
}
.small-button {
 width: 35px;
 height: 35px;
 padding: 5px;
}
</style>