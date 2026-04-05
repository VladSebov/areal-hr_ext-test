<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Отделы</div>
      <q-btn color="primary" icon="add" label="Новый отдел" @click="openDialog()" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-organization="props">
        <q-td :props="props">
          {{ props.row.organization?.name }}
        </q-td>
      </template>

      <template v-slot:body-cell-parent="props">
        <q-td :props="props">
          {{ props.row.parent?.name }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn flat round color="blue" icon="edit" @click="openDialog(props.row)" />
          <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialog.isEdit ? 'Редактирование' : 'Создание' }} Отдела</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-input v-model="form.name" label="Название отдела *" outlined dense />

          <q-select
            v-model="form.organizationId"
            :options="orgOptions"
            label="Организация *"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            outlined
            dense
          />

          <q-select
            v-model="form.parentId"
            :options="deptOptions"
            label="Вышестоящий отдел"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            outlined
            dense
            clearable
          />

          <q-input v-model="form.comment" label="Комментарий" type="textarea" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Закрыть" color="primary" v-close-popup />
          <q-btn unelevated label="Сохранить" color="primary" @click="save" :loading="saving" />
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
import axios from 'axios';

interface Organization {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  comment?: string;
  organization?: Organization;
  parent?: Department;
}

const $q = useQuasar();
const rows = ref<Department[]>([]);
const orgOptions = ref<Organization[]>([]);
const deptOptions = ref<Department[]>([]);
const loading = ref(false);
const saving = ref(false);

const dialog = reactive({
  show: false,
  isEdit: false,
  activeId: null as number | null
});

const form = reactive({
  name: '',
  comment: '',
  organizationId: null as number | null,
  parentId: null as number | null
});

const columns: QTableColumn[] = [
  { name: 'id', label: '№', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'organization', label: 'Организация', field: 'organization', align: 'left', sortable: true },
  { name: 'parent', label: 'Вышестоящий отдел', field: 'parent', align: 'left', sortable: true },
  { name: 'comment', label: 'Комментарий', field: 'comment', align: 'left' },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const [depts, orgs] = await Promise.all([
      api.get('/departments'),
      api.get('/organizations')
    ]);
    rows.value = depts.data;
    orgOptions.value = orgs.data;
    deptOptions.value = depts.data;
  } catch {
    $q.notify({ color: 'negative', message: 'Не удалось загрузить данные ' });
  } finally {
    loading.value = false;
  }
};

const openDialog = (row?: Department) => {
  if (row) {
    dialog.isEdit = true;
    dialog.activeId = row.id;
    form.name = row.name;
    form.comment = row.comment || '';
    form.organizationId = row.organization?.id || null;
    form.parentId = row.parent?.id || null;
    deptOptions.value = rows.value.filter(d => d.id !== row.id);
  } else {
    dialog.isEdit = false;
    dialog.activeId = null;
    form.name = '';
    form.comment = '';
    form.organizationId = null;
    form.parentId = null;
    deptOptions.value = rows.value;
  }
  dialog.show = true;
};

const save = async () => {
  if (!form.name || !form.organizationId) {
    $q.notify({ color: 'warning', message: 'Заполните обязательные поля' });
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.name,
      comment: form.comment || '',
      organizationId: form.organizationId,
      parentId: form.parentId || null
    };

    if (dialog.isEdit && dialog.activeId) {
      await api.patch(`/departments/${dialog.activeId}`, payload);
    } else {
      await api.post('/departments', payload);
    }

    dialog.show = false;
    await loadData();
    $q.notify({ color: 'positive', message: 'Успешно сохранено' });
  } catch (error: unknown) {
    let detail = 'Ошибка сохранения';
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message;
      detail = Array.isArray(errorMessage) 
        ? errorMessage.join(', ') 
        : (errorMessage || error.message);
    } else if (error instanceof Error) {
      detail = error.message;
    }

    $q.notify({
      color: 'negative',
      message: detail || 'Ошибка сохранения'
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Подтверждение удаления',
    message: 'Действительно хотите удалить эту запись??',
    cancel: true,
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/departments/${id}`);
        await loadData();
        $q.notify({ color: 'positive', message: 'Запись удалена' });
      } catch {
        $q.notify({ color: 'negative', message: 'Ошибка удаления' });
      }
    })();
  });
};

onMounted(loadData);
</script>
