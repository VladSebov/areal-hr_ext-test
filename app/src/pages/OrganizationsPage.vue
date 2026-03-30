<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Organizations</div>
      <q-btn color="primary" icon="add" label="New Organization" @click="openDialog()" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn flat round color="blue" icon="edit" @click="openDialog(props.row)" />
          <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialog.isEdit ? 'Edit' : 'Create' }} Organization</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-input v-model="form.name" label="Organization Name *" outlined dense />
          <q-input v-model="form.comment" label="Comment" type="textarea" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn unelevated label="Save" color="primary" @click="save" :loading="saving" />
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
import type { Organization } from 'src/types/models';

const $q = useQuasar();
const rows = ref<Organization[]>([]);
const loading = ref(false);
const saving = ref(false);

const dialog = reactive({
  show: false,
  isEdit: false,
  activeId: null as number | null
});

const form = reactive({
  name: '',
  comment: ''
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'comment', label: 'Comment', field: 'comment', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/organizations');
    rows.value = data;
  } catch {
    $q.notify({ color: 'negative', message: 'Failed to load data' });
  } finally {
    loading.value = false;
  }
};

const openDialog = (row?: Organization) => {
  if (row) {
    dialog.isEdit = true;
    dialog.activeId = row.id;
    form.name = row.name;
    form.comment = row.comment || '';
  } else {
    dialog.isEdit = false;
    dialog.activeId = null;
    form.name = '';
    form.comment = '';
  }
  dialog.show = true;
};

const save = async () => {
  if (!form.name) return;
  saving.value = true;
  try {
    if (dialog.isEdit && dialog.activeId) {
      await api.patch(`/organizations/${dialog.activeId}`, form);
    } else {
      await api.post('/organizations', form);
    }
    dialog.show = false;
    await loadData();
    $q.notify({ color: 'positive', message: 'Success' });
  } catch {
    $q.notify({ color: 'negative', message: 'Error saving' });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Delete this organization?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/organizations/${id}`);
        await loadData();
        $q.notify({ color: 'positive', message: 'Deleted' });
      } catch {
        $q.notify({ color: 'negative', message: 'Error deleting' });
      }
    })();
  });
};

onMounted(loadData);
</script>
