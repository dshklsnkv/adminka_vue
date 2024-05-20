<script setup>

import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag';
import { parseISO, format } from 'date-fns';
import { ref, reactive, computed, watchEffect } from 'vue';

const showFilter = ref(false); // Инициализация переменной showFilter как false
const toggleFilter = () => {
      showFilter.value = !showFilter.value; // Переключение значения showFilter при каждом нажатии на кнопку
    };

const sortField = ref(''); // Поле для сортировки по умолчанию
const sortDirection = ref('asc'); // Направление сортировки по умолчанию
// const filterIdParameterdatasourse = ref(''); // Фильтр для источника данных параметров
// const filterValue = ref(''); // Фильтр для значения
// const filterMomentChange = ref(''); // Фильтр для момента изменения

const sortedValues = computed(() => {
 return [...values.value].sort((a, b) => {
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
 showIdParameterdatasourse: true,
 showValue: true,
 showMomentChange: true,
});

function formatDateTime(dateTimeString) {
 const date = parseISO(dateTimeString);
 return format(date, "yyyy-MM-dd HH:mm:ss.SSS");
}

const showModal__ = ref(false);
function openModal_() {
      showModal__.value = true;
    }

const ALL_VALUES_QUERY = gql`
query MyQuery($idParameterDataSourse: [Int!], $momentChange: DateTime, $value: [Int!]) {
 ParameterValues(idParameterDataSourse: $idParameterDataSourse, momentChange: $momentChange, value: $value) {
    idParameterdatasourse
    momentChange
    value
  }
}
`;

const idParameterDataSourse = ref(null);
const momentChange = ref(null);
const value = ref(null);

const {result: resultValue} = useQuery(ALL_VALUES_QUERY, () => ({
 idParameterDataSourse: idParameterDataSourse.value,
 momentChange: momentChange.value,
 value: value.value
}));

const resetFilters = () => {
 idParameterDataSourse.value = null;
 momentChange.value = null;
 value.value = null
};

const values = computed(() => resultValue.value?.ParameterValues ?? [])

watchEffect(() => {
 console.log(values.value);
});

function getUniqueValues(array, key) {
 return [...new Set(array.map(item => item[key]))];
}

// Вычисляемые свойства для получения уникальных значений для каждого из полей
const uniqueIdParameterDataSources = computed(() => getUniqueValues(values.value, 'idParameterDataSourse'));
const uniqueValues = computed(() => getUniqueValues(values.value, 'value'));
const uniqueMomentChanges = computed(() => getUniqueValues(values.value, 'momentChange'));


const DELETE_VALUE_MUTATION = gql`
mutation deleteParametervalue($parametervalueId: Int!) {
 deleteParametervalue(parametervalueId: $parametervalueId)
}
`;

const { mutate: deleteParametervalue } = useMutation(DELETE_VALUE_MUTATION, {
 refetchQueries: [{ query: ALL_VALUES_QUERY }],
});
// Функция для удаления параметра с подтверждением
const deleteValueWithConfirm = (parametervalueId) => {
 if (window.confirm('Вы уверены, что хотите удалить это значение?')) {
    deleteParametervalue({ parametervalueId })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при удалении:', error);
      });
 }
};

const UPDATE_VALUE_MUTATION = gql`
mutation updateParametervalue( $parametervalueData: ParameterValueInput!, $parametervalueId: Int!) {
 updateParametervalue(parametervalueData: $parametervalueData, parametervalueId: $parametervalueId) 
}
`;
const { mutate: updateParametervalue } = useMutation(UPDATE_VALUE_MUTATION, {
 refetchQueries: [{ query: ALL_VALUES_QUERY }],
});
const showModal_value = ref(false);
const editingParameterdatasourseId = ref(null);
const newParametervalueData = reactive({
 idParameterdatasourse: '',
 value: '',
 momentChange:''
});

const editParametervalue = (parameterdatasourseId) => {
 const value = values.value.find(p => p.idParameterdatasourse === parameterdatasourseId);
 if (value) {
    editingParameterdatasourseId.value = parameterdatasourseId;
    // newParameterlimitData.idParameterlimit = limit.idParameterlimit;
    newParametervalueData.idParameterdatasourse = value.idParameterdatasourse;
    newParametervalueData.value = value.value;
    newParametervalueData.momentChange = value.momentChange;
    showModal_value.value = true;
 }
};

const UpdateParameterValueWithConfirm = () => {
 if (window.confirm('Вы уверены, что хотите сохранить изменения?')) {
    newParametervalueData.idParameterdatasourse = parseInt(newParametervalueData.idParameterdatasourse, 10);
    newParametervalueData.value = parseInt(newParametervalueData.value, 10);
    updateParametervalue({ parametervalueId: editingParameterdatasourseId.value, parametervalueData: newParametervalueData })
      .then(() => {
        editingParameterdatasourseId.value = null; // Сбросить ID редактируемого параметра
        showModal_value.value = false;
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при обновлении:', error);
      });
 }
};

const CREATE_VALUE_MUTATION = gql`
mutation createParametervalue($parametervalueData: ParameterValueInput!) {
 createParametervalue(parametervalueData: $parametervalueData) {
    idParameterdatasourse
    value
    momentChange
 }
}
`;

const showModal_value_ = ref(false);
    const newParametervalue = ref({
      idParameterdatasourse: '',
      value: '',
      momentChange: '',
    });

    const { mutate: createParametervalue} = useMutation(CREATE_VALUE_MUTATION, {
      refetchQueries: [{ query: ALL_VALUES_QUERY }],
    });

    function openModal() {
      showModal_value_.value = true;
    }

    function addParametervalue() {
      const parametervalueData = {
    ...newParametervalue.value,
    idParameterdatasourse:parseInt(newParametervalue.value.idParameterdatasourse,10),
    value:parseInt(newParametervalue.value.value, 10)
 };
      createParametervalue({ parametervalueData})
        .then(() => {
          showModal_value_.value = false;
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
            <th colspan="6">
              <div class="header-container" style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin-left: 5px;">Значения</h2>
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
                    <input type="checkbox" v-model="displaySettings.showIdParameterdatasourse">
                    Источник данных параметров
                </label>
                <label>
                    <input type="checkbox" v-model="displaySettings.showValue">
                    Значение
                </label>
                <label>
                    <input type="checkbox" v-model="displaySettings.showMomentChange">
                    Момент изменения
                </label>
                </div>
                </div>
                </div>
                </div>
            </th>
          </tr>
          <tr v-if="showFilter">
              <td colspan="4">
                  <select v-model="idParameterDataSourse">
                    <option v-for="id in uniqueIdParameterDataSources" :key="id" :value="id">
                      {{ id }}
                    </option>
                  </select>
                  <select v-model="value">
                    <option v-for="value in uniqueValues" :key="value" :value="value">
                      {{ value }}
                    </option>
                  </select>
                  <select v-model="momentChange">
                    <option v-for="date in uniqueMomentChanges" :key="date" :value="date">
                      {{ date }}
                    </option>
                  </select>
                <button @click="resetFilters">Сбросить фильтры</button>
              </td>
          </tr>
          <!-- <tr>
          <td colspan="4">
          <input class="filter-in_"v-model="filterIdParameterdatasourse" placeholder="Фильтр по источнику данных параметров">
          <input class="filter-in_"v-model="filterValue" placeholder="Фильтр по значению">
          <input class="filter-in_"v-model="filterMomentChange" placeholder="Фильтр по моменту изменения">
        </td>
      </tr> -->
          <tr>
              <th v-if="displaySettings.showIdParameterdatasourse" @click="sort('idParameterdatasourse')">
                  Источник данных параметров 
                  <span v-if="sortField === 'idParameterdatasourse'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th v-if="displaySettings.showValue" @click="sort('value')">
                  Значение 
                  <span v-if="sortField === 'value'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th v-if="displaySettings.showMomentChange" @click="sort('momentChange')">
                  Момент изменения
                  <span v-if="sortField === 'momentChange'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th>Действия</th>
              </tr>
           </thead>
           <tbody v-if="sortedValues.length">
           <tr v-for="value in sortedValues" :key="value.idParameterdatasource">
                <td v-if="displaySettings.showIdParameterdatasourse">{{ value.idParameterdatasourse }}</td>
                <td v-if="displaySettings.showValue">{{ value.value }}</td>
                <td v-if="displaySettings.showMomentChange">{{ formatDateTime(value.momentChange) }}</td>
                <td>
                <button @click="deleteValueWithConfirm(value.idParameterdatasourse)" class="btn btn-danger btn-small"><i class="material-icons">delete</i></button>
                <button @click="editParametervalue(value.idParameterdatasourse)" class="btn btn-primary btn-small"><i class="material-icons">edit</i></button>
               </td>
             </tr>
           </tbody>
         </table>
         <div v-if="showModal_value" class="modal">
 <div class="modal-content">
  <span class="close" @click="showModal_value= false">&times;</span>
      <form @submit.prevent="UpdateParameterValueWithConfirm">
        <label for="idParameterdatasourse">Источник данных параметров:</label> 
        <input v-model="newParametervalueData.idParameterdatasourse" placeholder="Источник данных параметров">
        <label for="value">Значение:</label>
        <input v-model="newParametervalueData.value" placeholder="Значение">
        <label for="momentChange">Момент изменения:</label> 
        <input v-model="newParametervalueData.momentChange" placeholder="Момент изменения">
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
 </div>
 <div style="overflow: hidden;">
    <div v-if="showModal_value_" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal_value_ = false">&times;</span>
      <form @submit.prevent="addParametervalue">
          <label for="idParameterdatasourse">Источник данных параметров:</label>
          <input id="idParameterdatasourse" v-model="newParametervalue.idParameterdatasourse" type="text" required>

          <label for="value">Значение:</label>
          <input id="value" v-model="newParametervalue.value" type="text" required>

          <label for="momentСhange">Момент изменения:</label>
          <input id="momentChange" v-model="newParametervalue.momentChange" type="text" required>
        <button type="submit">Добавить</button>
      </form>
    </div>
  </div>
 </div>
</div>
 </div>
 </template>

<style>
.filter-in_ {
 margin-right: 5px; 
}
</style>