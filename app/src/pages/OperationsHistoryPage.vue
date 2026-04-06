<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">История операций</div>
      <q-btn
        flat
        color="primary"
        icon="refresh"
        label="Обновить"
        @click="loadData"
      />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :pagination="{ rowsPerPage: 20 }"
    >
      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          {{ formatDate(props.row.createdAt) }}
        </q-td>
      </template>

      <template v-slot:body-cell-operationType="props">
        <q-td :props="props">
          <q-chip
            :color="getOperationColor(props.row.operationType)"
            text-color="white"
            dense
            square
          >
            {{ props.row.operationType }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-entityType="props">
        <q-td :props="props">
          <q-badge outline color="secondary">
            {{ getEntityLabel(props.row.entityType) }}
          </q-badge>
          <div class="text-caption text-grey-7 q-mt-xs">ID: {{ props.row.entityId }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-changes="props">
        <q-td :props="props">
          <div v-if="props.row.fieldName" class="changes-container">
            <span class="text-weight-medium text-primary">{{ props.row.fieldName }}:</span>
            <div class="row items-center no-wrap q-gutter-x-xs">
              <span class="value-old">{{ props.row.oldValue || 'пусто' }}</span>
              <q-icon name="arrow_forward" size="xs" color="grey" />
              <span class="value-new">{{ props.row.newValue || 'пусто' }}</span>
            </div>
          </div>
          <div v-else class="text-italic text-grey">
            {{ props.row.operationType === 'CREATE' ? 'Первичное создание' : 'Удаление записи' }}
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { api } from 'boot/axios';

// Соответствие вашей TypeScript модели
interface OperationsHistory {
  id: number;
  operationType: string;
  entityType: string;
  entityId: number;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  userId: number | null;
  createdAt: string;
}

const $q = useQuasar();
const rows = ref<OperationsHistory[]>([]);
const loading = ref(false);

const columns: QTableColumn[] = [
  { name: 'createdAt', label: 'Дата и время', field: 'createdAt', align: 'left', sortable: true },
  { name: 'userId', label: 'ID Пользователя', field: 'userId', align: 'left' },
  { name: 'operationType', label: 'Действие', field: 'operationType', align: 'left' },
  { name: 'entityType', label: 'Объект', field: 'entityType', align: 'left' },
  { name: 'changes', label: 'Изменения', field: (row: OperationsHistory) => row.fieldName, align: 'left' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get<OperationsHistory[]>('/operations-history');
    rows.value = data;
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при загрузке истории' });
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('ru-RU');
};

const getOperationColor = (op: string) => {
  const map: Record<string, string> = {
    'CREATE': 'positive',
    'UPDATE': 'orange',
    'DELETE': 'negative'
  };
  return map[op] || 'grey';
};

const getEntityLabel = (name: string) => {
  const map: Record<string, string> = {
    'Organization': 'Организация',
    'Department': 'Отдел',
    'Position': 'Должность',
    'Employee': 'Сотрудник',
    'HrOperation': 'Кадровая операция',
    'PassportScan': 'Скан паспорта',
    'File': 'Файл'
  };
  return map[name] || name;
};

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.changes-container {
  font-size: 12px;
  line-height: 1.4;
}
.value-old {
  color: #c62828;
  text-decoration: line-through;
  background: #ffebee;
  padding: 0 2px;
  border-radius: 2px;
}
.value-new {
  color: #2e7d32;
  background: #e8f5e9;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
