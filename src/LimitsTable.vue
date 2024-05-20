<script setup>

import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag';
import { parseISO, format } from 'date-fns';
import { ref, reactive, computed, watchEffect } from 'vue';

// const totalItems = computed(() => limits.value.length); // Общее количество элементов в таблице
// const displayedItems = computed(() => paginatedLimits.value.length); // Количество отображаемых элементов
// const filteredItems = computed(() => sortedLimits.value.length); // Количество отфильтрованных элементов

// const itemsPerPage = 14; // Количество элементов на странице
// const currentPage = ref(1); // Текущая страница
// const totalPages = computed(() => Math.ceil(limits.value.length / itemsPerPage)); // Общее количество страниц

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

// const paginatedLimits = computed(() => {
//  const start = (currentPage.value - 1) * itemsPerPage;
//  const end = start + itemsPerPage;
//  return sortedLimits.value.slice(start, end);
// });

const props = defineProps({
 parameter: Object,
});

const showFilter = ref(false); // Инициализация переменной showFilter как false
const toggleFilter = () => {
      showFilter.value = !showFilter.value; // Переключение значения showFilter при каждом нажатии на кнопку
    };

const sortField = ref(''); // Поле для сортировки по умолчанию
const sortDirection = ref('asc'); // Направление сортировки по умолчанию
// const filterIdParameter = ref(''); // Поле для фильтрации по ID параметра
// const filterIdLimitType = ref(''); // Поле для фильтрации по ID типа уставки
// const filterMinLimit = ref(''); // Поле для фильтрации по минимальной уставке
// const filterMaxLimit = ref(''); // Поле для фильтрации по максимальной уставке

// const filteredLimits = computed(() => {
//  return sortedLimits.value.filter(limit => {
//     const idParameterMatches = !filterIdParameter.value || limit.idParameter.toString().includes(filterIdParameter.value);
//     const idLimitTypeMatches = !filterIdLimitType.value || limit.idLimitType.toString().includes(filterIdLimitType.value);
//     const minLimitMatches = !filterMinLimit.value || limit.minLimit.toString().includes(filterMinLimit.value);
//     const maxLimitMatches = !filterMaxLimit.value || limit.maxLimit.toString().includes(filterMaxLimit.value);
//     return idParameterMatches && idLimitTypeMatches && minLimitMatches && maxLimitMatches;
//  });
// });


const sortedLimits = computed(() => {
 return [...limits.value].sort((a, b) => {
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
 showParameter: false,
 showLimitType: true,
 showMinLimit: true,
 showMaxLimit: true,
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

const ALL_LIMITS_QUERY = gql`
query MyQuery($idLimitType: [Int!], $idParameter: [Int!], $maxLimit: [Int!], $minLimit: [Int!], $momentBegin: DateTime, $momentEnd: DateTime) {
 ParameterLimits(idLimitType: $idLimitType, idParameter: $idParameter, maxLimit: $maxLimit, minLimit: $minLimit, momentBegin: $momentBegin, momentEnd: $momentEnd) {
    idParameterlimit
    idLimitType
    idParameter
    maxLimit
    minLimit
    momentBegin
    momentEnd
    LimitType {
      longName
    }
    ParameterName {
      nameParameter
    }
  }
}
`;
const idLimitType = ref([]);
const idParameter = ref([]);
const maxLimit = ref([]);
const minLimit = ref([]);
const momentBegin = ref(null);
const momentEnd = ref(null);

const { result: resultLimit } = useQuery(ALL_LIMITS_QUERY, () => {
      // Условие для выбора параметров запроса
      let queryParameters = {
        idLimitType: idLimitType.value,
        idParameter: idParameter.value,
        maxLimit: maxLimit.value,
        minLimit: minLimit.value,
        momentBegin: momentBegin.value,
        momentEnd: momentEnd.value,
      };

      // Если props и props.parameter определены, используем их для запроса
      if (props && props.parameter) {
        queryParameters.idParameter = props.parameter.idParameter;
      }

      return queryParameters;
    });


const resetFilters = () => {
 idLimitType.value = [];
 idParameter.value = [];
 maxLimit.value = [];
 minLimit.value = [];
 momentBegin.value = null;
 momentEnd.value = null;
};

const limits = computed(() => resultLimit.value?.ParameterLimits ?? [])

watchEffect(() => {
 console.log(limits.value);
});

function getUniqueValues(array, key) {
 return [...new Set(array.map(item => item[key]))];
}

const uniqueIdParameters = computed(() => getUniqueValues(limits.value, 'idParameter'));
const uniqueIdLimitTypes = computed(() => getUniqueValues(limits.value, 'idLimitType'));
const uniqueMinLimits = computed(() => getUniqueValues(limits.value, 'minLimit'));
const uniqueMaxLimits = computed(() => getUniqueValues(limits.value, 'maxLimit'));
const uniqueMomentBegins = computed(() => getUniqueValues(limits.value, 'momentBegin'));
const uniqueMomentEnds = computed(() => getUniqueValues(limits.value, 'momentEnd'));


const DELETE_LIMIT_MUTATION = gql`
mutation deleteParameterlimit($parameterlimitId: Int!) {
 deleteParameterlimit(parameterlimitId: $parameterlimitId)
}
`;
const { mutate: deleteParameterlimit } = useMutation(DELETE_LIMIT_MUTATION, {
 refetchQueries: [{ query: ALL_LIMITS_QUERY }],
});
// Функция для удаления параметра с подтверждением
const deleteLimitWithConfirm = (parameterlimitId) => {
 if (window.confirm('Вы уверены, что хотите удалить эту уставку?')) {
    deleteParameterlimit({ parameterlimitId })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при удалении:', error);
      });
 }
};

const UPDATE_LIMIT_MUTATION = gql`
mutation updateParameterlimit( $parameterlimitData: ParameterLimitInput!, $parameterlimitId: Int!) {
 updateParameterlimit(parameterlimitData: $parameterlimitData, parameterlimitId: $parameterlimitId) 
}
`;
const { mutate: updateParameterlimit } = useMutation(UPDATE_LIMIT_MUTATION, {
 refetchQueries: [{ query: ALL_LIMITS_QUERY }],
});

const showModal_limit = ref(false);
const editingParameterlimitId = ref(null);
const newParameterlimitData = reactive({
 idLimitType: '',
 idParameter: '',
 maxLimit:'',
 minLimit:'',
 momentBegin:'',
 momentEnd:''
});

const editParameterlimit = (parameterlimitId) => {
 const limit = limits.value.find(p => p.idParameterlimit === parameterlimitId);
 if (limit) {
    editingParameterlimitId.value = parameterlimitId;
    newParameterlimitData.idParameterlimit = limit.idParameterlimit;
    newParameterlimitData.idLimitType = limit.idLimitType;
    newParameterlimitData.idParameter = limit.idParameter;
    newParameterlimitData.maxLimit = limit.maxLimit;
    newParameterlimitData.minLimit = limit.minLimit;
    newParameterlimitData.momentBegin = limit.momentBegin;
    newParameterlimitData.momentEnd = limit.momentEnd;
    showModal_limit.value = true;
 }
};

const UpdateParameterLimitWithConfirm = () => {
 if (window.confirm('Вы уверены, что хотите сохранить изменения?')) {
    newParameterlimitData.idLimitType = parseInt(newParameterlimitData.idLimitType, 10);
    newParameterlimitData.idParameter = parseInt(newParameterlimitData.idParameter, 10);
    newParameterlimitData.maxLimit = parseInt(newParameterlimitData.maxLimit, 10);
    newParameterlimitData.minLimit = parseInt(newParameterlimitData.minLimit, 10);
    updateParameterlimit({ parameterlimitId: editingParameterlimitId.value, parameterlimitData: newParameterlimitData })
      .then(() => {
        editingParameterlimitId.value = null; // Сбросить ID редактируемого параметра
        showModal_limit.value = false;
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при обновлении:', error);
      });
 }
};

const CREATE_LIMIT_MUTATION = gql`
mutation createParameterlimit($parameterlimitData: ParameterLimitInput!) {
 createParameterlimit(parameterlimitData: $parameterlimitData) {
    idParameterlimit
    idLimitType
    idParameter
    maxLimit
    minLimit
    momentBegin
    momentEnd
 }
}
`;

const showModal_limit_ = ref(false);
    const newParameterlimit = ref({
      idParameterlimit: '',
      idLimitType: '',
      idParameter: '',
      maxLimit: '',
      minLimit: '',
      momentBegin: '',
      momentEnd: '',
    });

    const { mutate: createParameterlimit } = useMutation(CREATE_LIMIT_MUTATION, {
      refetchQueries: [{ query: ALL_LIMITS_QUERY }],
    });

    function openModal() {
      showModal_limit_.value = true;
    }

    function addParameterlimit() {
      const parameterlimitData = {
    ...newParameterlimit.value,
    idParameterlimit:parseInt(newParameterlimit.value.idParameterlimit,10),
    idLimitType:parseInt(newParameterlimit.value.idLimitType, 10),
    idParameter: parseInt(newParameterlimit.value.idParameter, 10),
    maxLimit: parseInt(newParameterlimit.value.maxLimit, 10),
    minLimit: parseInt(newParameterlimit.value.minLimit, 10)
 };
      createParameterlimit({ parameterlimitData})
        .then(() => {
          showModal_limit_.value = false;
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
                <h2 style="margin-left: 5px;">Уставки</h2>
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
                    <input type="checkbox" v-model="displaySettings.showParameter">
                    Параметр
                </label>
                <label>
                    <input type="checkbox" v-model="displaySettings.showLimitType">
                    Тип уставки
                </label>
                <label>
                    <input type="checkbox" v-model="displaySettings.showMinLimit">
                    Мин уставка
                </label>
                <label>
                    <input type="checkbox" v-model="displaySettings.showMaxLimit">
                    Макс уставка
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
          <!-- <tr>
          <td colspan="8">
          <input class="filter_" v-model="filterIdParameter" placeholder="Фильтр по параметру">
          <input class="filter_" v-model="filterIdLimitType" placeholder="Фильтр по типу уставки">
          <input class="filter_" v-model="filterMinLimit" placeholder="Фильтр по минимальной уставке">
          <input class="filter_" v-model="filterMaxLimit" placeholder="Фильтр по максимальной уставке">
          </td>
          </tr> -->
          <tr v-if="showFilter">
              <td colspan="7">
                <select v-model="idParameter">
                  <option v-for="id in uniqueIdParameters" :key="id" :value="id">
                    {{ id }}
                  </option>
                </select>
                <select v-model="idLimitType">
                    <option v-for="type in uniqueIdLimitTypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                <select v-model="minLimit">
                    <option v-for="min in uniqueMinLimits" :key="min" :value="min">
                      {{ min }}
                    </option>
                  </select>
                  <select v-model="maxLimit">
                    <option v-for="max in uniqueMaxLimits" :key="max" :value="max">
                      {{ max }}
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
                <button @click="resetFilters">Сбросить фильтры</button>
              </td>
          </tr>
          <tr>
          <th v-if="displaySettings.showParameter" @click="sort('idParameter')">
              Параметр 
              <span v-if="sortField === 'idParameter'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th v-if="displaySettings.showLimitType" @click="sort('idLimitType')">
              Тип уставки 
              <span v-if="sortField === 'idLimitType'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th v-if="displaySettings.showMinLimit" @click="sort('minLimit')">
              Мин уставка
              <span v-if="sortField === 'minLimit'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th v-if="displaySettings.showMaxLimit" @click="sort('maxLimit')">
              Макс уставка
              <span v-if="sortField === 'maxLimit'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th v-if="displaySettings.showMomentBegin"> Момент начала</th>
          <th v-if="displaySettings.showMomentEnd"> Момент конца</th>
          <th>Действия</th>
          </tr>
           </thead>
           <tbody v-if="sortedLimits.length">
           <tr v-for="limit in sortedLimits" :key="limit.idParameterlimit">
              <td v-if="displaySettings.showParameter">{{ limit.idParameter }}, {{ limit.ParameterName[0].nameParameter}}</td>
              <td v-if="displaySettings.showLimitType">{{ limit.idLimitType }},{{ limit.LimitType [0].longName}}</td>
              <td v-if="displaySettings.showMinLimit">{{ limit.minLimit }}</td>
              <td v-if="displaySettings.showMaxLimit">{{ limit.maxLimit }}</td>
              <td v-if="displaySettings.showMomentBegin">{{ formatDateTime(limit.momentBegin) }}</td>
              <td v-if="displaySettings.showMomentEnd">{{ formatDateTime(limit.momentEnd) }}</td>
               <td>
                <button @click="deleteLimitWithConfirm(limit.idParameterlimit)" class="btn btn-danger btn-small"><i class="material-icons">delete</i></button>
                <button @click="editParameterlimit(limit.idParameterlimit)" class="btn btn-primary btn-small"><i class="material-icons">edit</i></button>
               </td>
             </tr>
           </tbody>
         </table>
        //  <div class="pagination" style="width:100%;">
        // <div>
        // <span style="margin-right: 10px;">Всего элементов: {{ totalItems }}</span>
        // <span style="margin-right: 10px;">Отображаемых элементов: {{ displayedItems }}</span>
        // <span style="margin-right: 10px;" v-if="showFilter">Отфильтрованных элементов: {{ filteredItems }}</span>
        // <button class="btn btn-secondary" style="margin-right: 10px;" @click="previousPage">Предыдущая</button>
        // <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        // <button class="btn btn-secondary" style="margin-left: 10px;" @click="nextPage">Следующая</button>
        // </div>
        // </div>
         <div v-if="showModal_limit" class="modal">
 <div class="modal-content">
  <span class="close" @click="showModal_limit= false">&times;</span>
      <form @submit.prevent="UpdateParameterLimitWithConfirm">
        <label for="idParameter">Параметер:</label> 
        <input v-model="newParameterlimitData.idParameter" placeholder="Параметер">
        <label for="idLimitType">Тип уставки:</label>
        <input v-model="newParameterlimitData.idLimitType" placeholder="Тип уставки">
        <label for="minLimit">Мин уставка:</label>
        <input v-model="newParameterlimitData.minLimit" placeholder="мин уставка">
        <label for="maxLimit">Макс уставка:</label> 
        <input v-model="newParameterlimitData.maxLimit" placeholder="макс уставка">
        <label for="momentBegin">Момент начала:</label> 
        <input v-model="newParameterlimitData.momentBegin" placeholder="моментначала">
        <label for="momentEnd">Момент конца:</label> 
        <input v-model="newParameterlimitData.momentEnd" placeholder="моментконца">
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
 </div>
    <div style="overflow: hidden;">
    <div v-if="showModal_limit_" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal_limit_ = false">&times;</span>
      <form @submit.prevent="addParameterlimit">
          <label for="idParameterlimit">№:</label>
          <input id="idParameterlimit" v-model="newParameterlimit.idParameterlimit" type="text" required>

          <label for="idParameter">Параметр:</label>
          <input id="idParameter" v-model="newParameterlimit.idParameter" type="text" required>

          <label for="idLimitType">Тип уставки:</label>
          <input id="idLimitType" v-model="newParameterlimit.idLimitType" type="text" required>

          <label for="minLimit">Мин уставка:</label>
          <input id="minLimit" v-model="newParameterlimit.minLimit" type="text" required>

          <label for="maxLimit">Макс уставка:</label>
          <input id="maxLimit" v-model="newParameterlimit.maxLimit" type="text" required>

          <label for="momentBegin">Момент начала:</label>
          <input id="momentBegin" v-model="newParameterlimit.momentBegin" type="text" required>

          <label for="momentEnd">Момент конца:</label>
          <input id="momentEnd" v-model="newParameterlimit.momentEnd" type="text" required>
        <button type="submit">Добавить</button>
      </form>
    </div>
  </div>
  </div>
</div>
 </div>
 </template>
 <style>
 .filter_ {
  margin-right: 5px; /*отступ справа */
 }

.container_ table {
 margin-bottom: 20px; /* Отступ снизу */
}
.container_ table td:last-child {
 width: 70px; /* фиксированная ширина для последней колонки */
}
 </style>
 