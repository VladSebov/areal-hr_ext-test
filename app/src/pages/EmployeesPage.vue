<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h5 text-weight-bold">Сотрудники</div>

        <q-input
          v-model="filters.search"
          placeholder="Поиск (ФИО, паспорт)..."
          outlined
          dense
          clearable
          style="min-width: 300px"
          @update:model-value="loadData"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-toggle
          v-model="filters.showDeleted"
          label="Показать уволенных"
          color="negative"
          @update:model-value="loadData"
        />
      </div>

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
      <template v-slot:body="props">
        <q-tr :props="props" :class="{ 'bg-grey-2 text-grey-7': props.row.deletedAt }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'fullName'">
              {{ props.row.lastName }} {{ props.row.firstName }} {{ props.row.middleName }}
              <q-badge v-if="props.row.deletedAt" color="negative" label="Уволен" class="q-ml-sm" />
            </template>

            <template v-else-if="col.name === 'actions'">
              <div class="q-gutter-x-sm">
                <q-btn
                  flat round color="blue" icon="edit"
                  @click="openDialog(props.row)"
                  :disable="!!props.row.deletedAt"
                >
                  <q-tooltip v-if="props.row.deletedAt">Нельзя редактировать уволенного</q-tooltip>
                </q-btn>
                <q-btn
                  flat round color="negative" icon="delete"
                  @click="confirmDelete(props.row.id)"
                  :disable="!!props.row.deletedAt"
                />
              </div>
            </template>

            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="min-width: 900px; max-width: 95vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ dialog.isEdit ? 'Редактирование' : 'Создание' }} сотрудника
            <q-badge v-if="form.deletedAt" color="negative" label="АРХИВНАЯ ЗАПИСЬ" />
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-sm scroll" style="max-height: 75vh">
          <div class="text-subtitle2 text-primary">Основная информация</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-input v-model="form.lastName" label="Фамилия *" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.firstName" label="Имя *" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.middleName" label="Отчество" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.birthDate" label="Дата рождения *" type="date" stack-label outlined dense :disable="!!form.deletedAt" />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 text-primary">Паспортные данные</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportSeries" label="Серия *" outlined dense mask="####" unmasked-value :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportNumber" label="Номер *" outlined dense mask="######" unmasked-value :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportDate" label="Дата выдачи *" type="date" stack-label outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="form.passportCode" label="Код подразделения *" outlined dense mask="###-###" unmasked-value :disable="!!form.deletedAt" />
            </div>
            <div class="col-12">
              <q-input v-model="form.passportPlace" label="Кем выдан *" outlined dense autogrow :disable="!!form.deletedAt" />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 text-primary">Адрес регистрации</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.registrationRegion" label="Регион *" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.registrationLocality" label="Населенный пункт *" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.registrationStreet" label="Улица *" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-2">
              <q-input v-model="form.registrationHouse" label="Дом *" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-2">
              <q-input v-model="form.registrationHousing" label="Корпус/Стр" outlined dense :disable="!!form.deletedAt" />
            </div>
            <div class="col-12 col-sm-2">
              <q-input v-model="form.registrationApartment" label="Кв/Офис" outlined dense :disable="!!form.deletedAt" />
            </div>
          </div>

          <q-separator class="q-my-md" v-if="form.deletedAt || dialog.activeId" />

          <div class="text-subtitle2 text-primary">Прикрепленные сканы</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-btn
                outline
                color="primary"
                icon="folder"
                label="Прикрепить скан"
                class="full-width"
                @click="openFileSelector"
                :disable="!dialog.activeId || !!form.deletedAt"
              />
            </div>

            <div v-if="form.passportScans?.length > 0" class="col-12">
              <q-list bordered separator dense>
                <q-item v-for="scan in form.passportScans" :key="scan.id" :class="{ 'bg-red-1': !scan.file }">
                  <q-item-section avatar>
                    <q-icon :name="scan.file ? 'description' : 'report_problem'" :color="scan.file ? 'primary' : 'negative'" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scan.file ? scan.file.name : 'Файл удален' }}</q-item-label>
                    <q-item-label caption>ID скана: {{ scan.id }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round dense icon="delete_forever" color="negative" @click="removeScan(scan.id)" :disable="!!form.deletedAt" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Закрыть" color="grey-7" v-close-popup />
          <q-btn unelevated label="Сохранить" color="primary" @click="save" :loading="saving" v-if="!form.deletedAt" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="fileSelector.show">
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <div class="text-h6">Прикрепить файл</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="scroll" style="max-height: 50vh">
          <q-list bordered separator>
            <q-item v-for="file in availableFiles" :key="file.id" clickable v-ripple @click="attachFile(file.id)">
              <q-item-section avatar><q-icon name="insert_drive_file" color="grey-7" /></q-item-section>
              <q-item-section><q-item-label>{{ file.name }}</q-item-label></q-item-section>
              <q-item-section side><q-btn flat round icon="add" color="primary" /></q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
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

interface FileEntity { id: number; name: string; }
interface PassportScan { id: number; file?: FileEntity; }
interface Employee {
  id: number; lastName: string; firstName: string; middleName: string;
  birthDate: string; passportSeries: string; passportNumber: string;
  passportDate: string; passportCode: string; passportPlace: string;
  registrationRegion: string; registrationLocality: string; registrationStreet: string;
  registrationHouse: string; registrationHousing: string; registrationApartment: string;
  passportScans: PassportScan[];
  deletedAt: string | null;
}

const $q = useQuasar();
const rows = ref<Employee[]>([]);
const loading = ref(false);
const saving = ref(false);

const filters = reactive({
  search: '',
  showDeleted: false
});

const availableFiles = ref<FileEntity[]>([]);
const fileSelector = reactive({ show: false });

const dialog = reactive({
  show: false,
  isEdit: false,
  activeId: null as number | null
});

const initialFormState = () => ({
  lastName: '', firstName: '', middleName: '', birthDate: '',
  passportSeries: '', passportNumber: '', passportDate: '',
  passportCode: '', passportPlace: '',
  registrationRegion: '', registrationLocality: '', registrationStreet: '',
  registrationHouse: '', registrationHousing: '', registrationApartment: '',
  passportScans: [] as PassportScan[],
  deletedAt: null as string | null
});

const form = reactive(initialFormState());

const columns: QTableColumn[] = [
  { name: 'id', label: '№', field: 'id', align: 'left', sortable: true },
  { name: 'fullName', label: 'ФИО', field: 'fullName', align: 'left', sortable: true },
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
    const { data } = await api.get<Employee[]>('/employees', {
      params: {
        search: filters.search || undefined,
        showDeleted: filters.showDeleted
      }
    });
    rows.value = data;
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка загрузки данных' });
  } finally {
    loading.value = false;
  }
};

const openDialog = async (row?: Employee) => {
  if (row) {
    dialog.isEdit = true;
    dialog.activeId = row.id;
    try {
      const { data } = await api.get<Employee>(`/employees/${row.id}`);
      Object.assign(form, data);
    } catch {
      Object.assign(form, { ...row });
    }
  } else {
    dialog.isEdit = false;
    dialog.activeId = null;
    Object.assign(form, initialFormState());
  }
  dialog.show = true;
};

const openFileSelector = async () => {
  try {
    const { data } = await api.get<FileEntity[]>('/files');
    const attachedIds = form.passportScans.map(s => s.file?.id);
    availableFiles.value = data.filter(f => !attachedIds.includes(f.id));
    fileSelector.show = true;
  } catch {
    $q.notify({ color: 'negative', message: 'Не удалось загрузить список файлов' });
  }
};

const attachFile = async (fileId: number) => {
  if (!dialog.activeId) return;
  try {
    await api.post('/passport-scans', { employeeId: dialog.activeId, fileId: fileId });
    const { data } = await api.get<Employee>(`/employees/${dialog.activeId}`);
    form.passportScans = data.passportScans;
    fileSelector.show = false;
    $q.notify({ color: 'positive', message: 'Файл прикреплен' });
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка привязки файла' });
  }
};

const removeScan = async (scanId: number) => {
  try {
    await api.delete(`/passport-scans/${scanId}`);
    form.passportScans = form.passportScans.filter(s => s.id !== scanId);
    $q.notify({ color: 'positive', message: 'Связь с файлом удалена' });
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при удалении' });
  }
};

const save = async () => {
  if (!form.lastName || !form.firstName || !form.passportSeries || !form.registrationRegion || !form.registrationLocality) {
    $q.notify({ color: 'warning', message: 'Заполните обязательные поля' });
    return;
  }

  saving.value = true;
  try {
    const payload = { ...form } as Record<string, unknown>;
    const toDelete = ['id', 'passportScans', 'operations', 'users', 'createdAt', 'updatedAt', 'deletedAt'];
    toDelete.forEach(key => { if (key in payload) delete payload[key]; });

    if (dialog.isEdit && dialog.activeId) {
      await api.patch(`/employees/${dialog.activeId}`, payload);
    } else {
      const res = await api.post('/employees', payload);
      dialog.activeId = res.data.id;
      dialog.isEdit = true;
    }

    await loadData();
    $q.notify({ color: 'positive', message: 'Данные сохранены' });
  } catch (error: unknown) {
    let detail = 'Ошибка сохранения';
    if (axios.isAxiosError(error)) {
      detail = error.response?.data?.message || error.message;
    }
    $q.notify({ color: 'negative', message: detail });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Увольнение',
    message: 'Вы уверены, что хотите уволить сотрудника?',
    cancel: true,
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/employees/${id}`);
        await loadData();
        $q.notify({ color: 'positive', message: 'Сотрудник уволен' });
      } catch {
        $q.notify({ color: 'negative', message: 'Ошибка при увольнении' });
      }
    })();
  });
};

onMounted(loadData);
</script>
