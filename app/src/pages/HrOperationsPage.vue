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

      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-chip :color="getOperationColor(props.row.type)" text-color="white" dense>
            {{ getOperationLabel(props.row.type) }}
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
            v-model="form.type"
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

          <template v-if="form.type !== 'DISMISSAL'">
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

          <q-input
            v-model="form.operationDate"
            label="Дата операции *"
            type="date"
            stack-label
            outlined
            dense
          />
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
  type: OperationType;
  employeeId: number;
  employee?: { firstName: string; lastName: string };
  departmentId?: number;
  positionId?: number;
  salary?: number;
  operationDate: string;
}

const $q = useQuasar();
const rows = ref<HrOperation[]>([]);
const loading = ref(false);
const saving = ref(false);

interface SelectOption {
  label: string;
  value: number;
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
  type: 'HIRE' as OperationType,
  employeeId: null as number | null,
  departmentId: null as number | null,
  positionId: null as number | null,
  salary: 0,
  operationDate: new Date().toISOString().split('T')[0]
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'operationDate', label: 'Дата', field: 'operationDate', align: 'left', sortable: true },
  { name: 'type', label: 'Тип', field: 'type', align: 'left' },
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
      api.get<{ id: number; title: string }[]>('/positions')
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
      label: p.title,
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
    type: 'HIRE',
    employeeId: null,
    departmentId: null,
    positionId: null,
    salary: 0,
    operationDate: new Date().toISOString().split('T')[0]
  });
  dialog.show = true;
};

const save = async () => {
  if (!form.employeeId || !form.operationDate) {
    $q.notify({ color: 'warning', message: 'Заполните обязательные поля' });
    return;
  }

  saving.value = true;
  try {
    const payload = { ...form } as Record<string, unknown>;

    const toDelete: (keyof typeof payload)[] = [];
    if (form.type === 'DISMISSAL') {
      toDelete.push('departmentId', 'positionId', 'salary');
    }

    toDelete.forEach(key => { if (key in payload) delete payload[key]; });

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
    message: 'Удаление записи не отменит изменения в данных сотрудника автоматически. Продолжить?',
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
  return colors[type];
};

onMounted(loadData);
</script>
