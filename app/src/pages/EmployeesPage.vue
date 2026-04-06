<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Сотрудники</div>
      <q-btn color="primary" icon="add" label="Добавить сотрудника" @click="openDialog()" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:body-cell-fullName="props">
        <q-td :props="props">
          {{ props.row.lastName }} {{ props.row.firstName }} {{ props.row.middleName }}
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
      <q-card style="min-width: 800px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialog.isEdit ? 'Редактирование' : 'Создание' }} сотрудника</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-sm scroll" style="max-height: 70vh">
          <div class="text-subtitle2 q-mb-none">Основная информация</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-input v-model="form.lastName" label="Фамилия *" outlined dense />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.firstName" label="Имя *" outlined dense />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.middleName" label="Отчество" outlined dense />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.birthDate" label="Дата рождения *" type="date" stack-label outlined dense />
            </div>
          </div>

          <q-separator q-my-md />
          <div class="text-subtitle2 q-mb-none">Паспортные данные</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportSeries" label="Серия *" outlined dense mask="####" unmasked-value />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportNumber" label="Номер *" outlined dense mask="######" unmasked-value />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportDate" label="Дата выдачи *" type="date" stack-label outlined dense />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportCode" label="Код подразделения *" outlined dense mask="###-###" unmasked-value />
            </div>
            <div class="col-12">
              <q-input v-model="form.passportPlace" label="Кем выдан *" outlined dense autogrow />
            </div>
          </div>

          <q-separator q-my-md />
          <div class="text-subtitle2 q-mb-none">Адрес регистрации</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.registrationRegion" label="Область / Регион *" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.registrationLocality" label="Населенный пункт *" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.registrationStreet" label="Улица *" outlined dense />
            </div>
            <div class="col-12 col-sm-2">
              <q-input v-model="form.registrationHouse" label="Дом *" outlined dense />
            </div>
            <div class="col-12 col-sm-2">
              <q-input v-model="form.registrationHousing" label="Корпус" outlined dense />
            </div>
            <div class="col-12 col-sm-2">
              <q-input v-model="form.registrationApartment" label="Кв." outlined dense />
            </div>
          </div>

          <q-separator q-my-md />
          <div class="text-subtitle2 q-mb-none">Сканы документов</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-file
                v-model="filesToUpload"
                label="Загрузить сканы паспорта"
                outlined
                dense
                multiple
                append
                use-chips
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
            <div v-if="form.passportScans.length > 0" class="col-12">
              <q-list bordered separator dense>
                <q-item v-for="scan in form.passportScans" :key="scan.id">
                  <q-item-section avatar>
                    <q-icon name="description" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    {{ scan.file?.name || 'Документ' }}
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round dense icon="delete" color="negative" @click="removeScan(scan.id)" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
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

interface FileEntity {
  id: number;
  name: string;
}

interface PassportScan {
  id: number;
  file?: FileEntity;
}

interface Employee {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  passportSeries: string;
  passportNumber: string;
  passportDate: string;
  passportCode: string;
  passportPlace: string;
  registrationRegion: string;
  registrationLocality: string;
  registrationStreet: string;
  registrationHouse: string;
  registrationHousing: string;
  registrationApartment: string;
  passportScans: PassportScan[];
}

const $q = useQuasar();
const rows = ref<Employee[]>([]);
const loading = ref(false);
const saving = ref(false);
const filesToUpload = ref<File[]>([]);

const dialog = reactive({
  show: false,
  isEdit: false,
  activeId: null as number | null
});

const form = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  passportSeries: '',
  passportNumber: '',
  passportDate: '',
  passportCode: '',
  passportPlace: '',
  registrationRegion: '',
  registrationLocality: '',
  registrationStreet: '',
  registrationHouse: '',
  registrationHousing: '',
  registrationApartment: '',
  passportScans: [] as PassportScan[]
});

const columns: QTableColumn[] = [
  { name: 'id', label: '№', field: 'id', align: 'left', sortable: true },
  {
    name: 'fullName',
    label: 'ФИО',
    field: (row: Employee) => `${row.lastName} ${row.firstName} ${row.middleName}`,
    align: 'left',
    sortable: true
  },
  { name: 'birthDate', label: 'Дата рожд.', field: 'birthDate', align: 'left', sortable: true },
  {
    name: 'passport',
    label: 'Паспорт',
    field: (row: Employee) => `${row.passportSeries} ${row.passportNumber}`,
    align: 'left'
  },
  { name: 'registrationLocality', label: 'Нас. пункт', field: 'registrationLocality', align: 'left', sortable: true },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get<Employee[]>('/employees');
    rows.value = data;
  } catch {
    $q.notify({ color: 'negative', message: 'Не удалось загрузить данные сотрудников' });
  } finally {
    loading.value = false;
  }
};

const openDialog = async (row?: Employee) => {
  filesToUpload.value = [];
  if (row) {
    dialog.isEdit = true;
    dialog.activeId = row.id;
    Object.assign(form, { ...row });
    try {
      const { data } = await api.get<Employee>(`/employees/${row.id}`);
      Object.assign(form, data);
    } catch {
      Object.assign(form, { ...row });
    }
  } else {
    dialog.isEdit = false;
    dialog.activeId = null;
    Object.assign(form, {
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: '',
      passportSeries: '',
      passportNumber: '',
      passportDate: '',
      passportCode: '',
      passportPlace: '',
      registrationRegion: '',
      registrationLocality: '',
      registrationStreet: '',
      registrationHouse: '',
      registrationHousing: '',
      registrationApartment: '',
      passportScans: []
    });
  }
  dialog.show = true;
};

const removeScan = async (scanId: number) => {
  try {
    await api.delete(`/passport-scans/${scanId}`);
    form.passportScans = form.passportScans.filter(s => s.id !== scanId);
    $q.notify({ color: 'positive', message: 'Скан удален' });
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при удалении скана' });
  }
};

const uploadFiles = async (employeeId: number) => {
  for (const file of filesToUpload.value) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const fileRes = await api.post('/files/upload', formData);
      await api.post('/passport-scans', {
        employeeId,
        fileId: fileRes.data.id
      });
    } catch {
      $q.notify({ color: 'negative', message: `Ошибка загрузки файла ${file.name}` });
    }
  }
};

const save = async () => {
  if (!form.lastName || !form.firstName || !form.passportSeries || !form.passportNumber) {
    $q.notify({ color: 'warning', message: 'Заполните обязательные поля' });
    return;
  }

  saving.value = true;
  try {
    const payload = { ...form } as Record<string, unknown>;

    const toDelete: (keyof typeof payload)[] = [
      'id',
      'passportScans',
      'createdAt',
      'updatedAt',
      'deletedAt'
    ];

    toDelete.forEach(key => {
      if (key in payload) {
        delete payload[key];
      }
    });

    let employeeId: number;
    if (dialog.isEdit && dialog.activeId) {
      await api.patch(`/employees/${dialog.activeId}`, payload);
      employeeId = dialog.activeId;
    } else {
      const res = await api.post('/employees', payload);
      employeeId = res.data.id;
    }

    if (filesToUpload.value.length > 0) {
      await uploadFiles(employeeId);
    }

    dialog.show = false;
    await loadData();
    $q.notify({ color: 'positive', message: 'Сотрудник успешно сохранен' });
  } catch (error: unknown) {
    let detail = 'Ошибка сохранения';
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message;
      detail = Array.isArray(errorMessage)
        ? errorMessage.join(', ')
        : (errorMessage || error.message);
    }
    $q.notify({ color: 'negative', message: detail });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Удаление',
    message: 'Удалить сотрудника и все связанные данные?',
    cancel: true,
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/employees/${id}`);
        await loadData();
        $q.notify({ color: 'positive', message: 'Сотрудник удален' });
      } catch {
        $q.notify({ color: 'negative', message: 'Ошибка удаления' });
      }
    })();
  });
};
onMounted(loadData);
</script>
