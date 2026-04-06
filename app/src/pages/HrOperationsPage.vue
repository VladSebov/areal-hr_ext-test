<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Кадровые операции</div>
      <q-btn color="primary" icon="add" label="Новая операция" @click="openDialog()" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-employee="props">
        <q-td :props="props">
          {{ props.row.employee?.lastName }} {{ props.row.employee?.firstName }}
        </q-td>
      </template>

      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          {{ props.row.createdAt ? new Date(props.row.createdAt).toLocaleDateString('ru-RU') : '—' }}
        </q-td>
      </template>

      <template v-slot:body-cell-operationType="props">
        <q-td :props="props">
          <q-chip :color="getOperationColor(props.row.operationType)" text-color="white" dense>
            {{ getOperationLabel(props.row.operationType) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Регистрация операции</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-select
            v-model="form.operationType"
            :options="operationOptions"
            label="Тип операции *"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-model="form.employeeId"
            :options="employeeOptions"
            label="Сотрудник *"
            outlined
            dense
            emit-value
            map-options
          />

          <template v-if="form.operationType !== 'DISMISSAL'">
            <q-select
              v-model="form.departmentId"
              :options="departmentOptions"
              label="Отдел *"
              outlined
              dense
              emit-value
              map-options
            />
            <q-select
              v-model="form.positionId"
              :options="positionOptions"
              label="Должность *"
              outlined
              dense
              emit-value
              map-options
            />
            <q-input
              v-model.number="form.salary"
              label="Зарплата *"
              type="number"
              outlined
              dense
            />
          </template>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn unelevated label="Выполнить" color="primary" @click="save" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { api } from 'boot/axios';

type OperationType = 'HIRE' | 'TRANSFER' | 'SALARY_CHANGE' | 'DISMISSAL';

interface HrOperation {
  id: number;
  operationType: OperationType;
  employeeId: number;
  employee?: { firstName: string; lastName: string };
  departmentId?: number;
  positionId?: number;
  salary?: number;
  createdAt: string;
}

const $q = useQuasar();
const rows = ref<HrOperation[]>([]);
const loading = ref(false);
const saving = ref(false);

interface SelectOption {
  label: string;
  value: string | number;
}

const employeeOptions = ref<SelectOption[]>([]);
const departmentOptions = ref<SelectOption[]>([]);
const positionOptions = ref<SelectOption[]>([]);

const operationOptions = [
  { label: 'Принятие на работу', value: 'HIRE' },
  { label: 'Изменение зарплаты', value: 'SALARY_CHANGE' },
  { label: 'Перевод (изменение отдела)', value: 'TRANSFER' },
  { label: 'Увольнение', value: 'DISMISSAL' },
];

const dialog = reactive({ show: false });

const form = reactive({
  operationType: 'HIRE' as OperationType,
  employeeId: null as number | null,
  departmentId: null as number | null,
  positionId: null as number | null,
  salary: 0
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  {
    name: 'createdAt',
    label: 'Дата',
    field: 'createdAt',
    align: 'left',
    sortable: true
  },
  { name: 'operationType', label: 'Тип', field: 'operationType', align: 'left' },
  { name: 'employee', label: 'Сотрудник', field: 'employee', align: 'left' },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const [ops, emps, depts, posts] = await Promise.all([
      api.get<HrOperation[]>('/hr-operations'),
      api.get<{ id: number; firstName: string; lastName: string }[]>('/employees'),
      api.get<{ id: number; name: string }[]>('/departments'),
      api.get<{ id: number; name: string }[]>('/positions')
    ]);

    rows.value = ops.data;

    employeeOptions.value = emps.data.map((e) => ({
      label: `${e.lastName} ${e.firstName}`,
      value: e.id
    }));

    departmentOptions.value = depts.data.map((d) => ({
      label: d.name,
      value: d.id
    }));

    positionOptions.value = posts.data.map((p) => ({
      label: p.name,
      value: p.id
    }));
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка загрузки данных' });
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
  Object.assign(form, {
    operationType: 'HIRE',
    employeeId: null,
    departmentId: null,
    positionId: null,
    salary: 0
  });
  dialog.show = true;
};

const save = async () => {
  if (!form.employeeId) {
    $q.notify({ color: 'warning', message: 'Выберите сотрудника' });
    return;
  }

  saving.value = true;
  try {
    const payload = { ...form } as Record<string, unknown>;

    if (form.operationType === 'DISMISSAL') {
      delete payload.departmentId;
      delete payload.positionId;
      delete payload.salary;
    }

    await api.post('/hr-operations', payload);
    dialog.show = false;
    await loadData();
    $q.notify({ color: 'positive', message: 'Операция успешно проведена' });
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при выполнении операции' });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Отмена операции',
    message: 'Удаление записи. Продолжить?',
    cancel: true
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/hr-operations/${id}`);
        await loadData();
      } catch {
        $q.notify({ color: 'negative', message: 'Ошибка удаления' });
      }
    })();
  });
};

const getOperationLabel = (type: OperationType) => {
  return operationOptions.find(o => o.value === type)?.label || type;
};

const getOperationColor = (type: OperationType) => {
  const colors: Record<OperationType, string> = {
    HIRE: 'positive',
    TRANSFER: 'info',
    SALARY_CHANGE: 'warning',
    DISMISSAL: 'negative'
  };
  return colors[type] || 'grey';
};

onMounted(loadData);
</script>
