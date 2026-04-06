<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Файлы</div>
      <q-file
        v-model="fileToUpload"
        label="Загрузить файл"
        outlined
        dense
        class="q-ml-md"
        style="min-width: 300px"
        @update:model-value="handleUpload"
      >
        <template v-slot:prepend>
          <q-icon name="cloud_upload" />
        </template>
      </q-file>
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <q-icon
            :name="getFileIcon(props.row.mimeType)"
            color="grey-7"
            class="q-mr-xs"
          />
          {{ props.row.name }}
        </q-td>
      </template>

      <template v-slot:body-cell-fileSize="props">
        <q-td :props="props">
          {{ formatBytes(props.row.fileSize) }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn
            flat
            round
            color="primary"
            icon="download"
            @click="downloadFile(props.row)"
          />
          <q-btn
            flat
            round
            color="negative"
            icon="delete"
            @click="confirmDelete(props.row.id)"
          />
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

interface FileEntity {
  id: number;
  name: string;
  mimeType: string;
  fileSize: string | number;
  createdAt: string;
  objectKey: string;
}

const $q = useQuasar();
const rows = ref<FileEntity[]>([]);
const loading = ref(false);
const fileToUpload = ref<File | null>(null);

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'mimeType', label: 'Тип', field: 'mimeType', align: 'left' },
  { name: 'fileSize', label: 'Размер', field: 'fileSize', align: 'left', sortable: true },
  { name: 'createdAt', label: 'Дата загрузки', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get<FileEntity[]>('/files');
    rows.value = data;
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при загрузке списка файлов' });
  } finally {
    loading.value = false;
  }
};

const handleUpload = async (file: File | null) => {
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    await api.post('/files/upload', formData);
    $q.notify({ color: 'positive', message: 'Файл успешно загружен' });
    fileToUpload.value = null;
    await loadData();
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при загрузке файла' });
  }
};

const downloadFile = (file: FileEntity) => {
  window.open(`${process.env.API_URL || ''}/files/download/${file.id}`, '_blank');
};

const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Удаление',
    message: 'Вы действительно хотите удалить этот файл?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/files/${id}`);
        await loadData();
        $q.notify({ color: 'positive', message: 'Файл удален' });
      } catch {
        $q.notify({ color: 'negative', message: 'Не удалось удалить файл' });
      }
    })();
  });
};

const formatBytes = (bytes: string | number) => {
  const b = Number(bytes);
  if (b === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mime: string) => {
  if (mime.includes('image')) return 'image';
  if (mime.includes('pdf')) return 'picture_as_pdf';
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'table_view';
  return 'insert_drive_file';
};

onMounted(loadData);
</script>
