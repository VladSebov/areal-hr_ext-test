<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Сотрудники</div>
      <q-btn color="primary" icon="add" label="Добавить сотрудника" @click="openDialog()" />
    </div>

    <q-table :rows="rows" :columns="columns" row-key="id" :loading="loading" flat bordered>
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
      <q-card style="min-width: 900px; max-width: 95vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialog.isEdit ? 'Редактирование' : 'Создание' }} сотрудника</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-sm scroll" style="max-height: 75vh">
          <div class="text-subtitle2 text-primary">Основная информация</div>
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

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 text-primary">Паспортные данные</div>
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

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 text-primary">Адрес регистрации</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.registrationRegion" label="Регион (Область/Край) *" outlined dense />
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
              <q-input v-model="form.registrationHousing" label="Корпус/Стр" outlined dense />
            </div>
            <div class="col-12 col-sm-2">
              <q-input v-model="form.registrationApartment" label="Кв/Офис" outlined dense />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 text-primary">Прикрепленные сканы</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-btn
                outline
                color="primary"
                icon="folder"
                label="Выбрать из загруженных файлов"
                class="full-width"
                @click="openFileSelector"
                :disable="!dialog.activeId"
              >
                <q-tooltip v-if="!dialog.activeId">Сначала сохраните сотрудника, чтобы прикрепить файлы</q-tooltip>
              </q-btn>
            </div>

            <div v-if="form.passportScans && form.passportScans.length > 0" class="col-12">
              <q-list bordered separator dense>
                <q-item v-for="scan in form.passportScans" :key="scan.id" :class="{ 'bg-red-1': !scan.file }">
                  <q-item-section avatar>
                    <q-icon
                      :name="scan.file ? 'description' : 'report_problem'"
                      :color="scan.file ? 'primary' : 'negative'"
                      size="sm"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label :class="{ 'text-negative text-weight-bold': !scan.file }">
                      {{ scan.file ? scan.file.name : 'Файл удален из системы' }}
                    </q-item-label>

                    <q-item-label caption>
                      ID скана: {{ scan.id }}
                      <span v-if="!scan.file" class="text-negative"> (требуется перепривязка)</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete_forever"
                      :color="scan.file ? 'negative' : 'black'"
                      @click="removeScan(scan.id)"
                    >
                      <q-tooltip>{{ scan.file ? 'Удалить скан' : 'Очистить битую ссылку' }}</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Закрыть" color="grey-7" v-close-popup />
          <q-btn unelevated label="Сохранить" color="primary" @click="save" :loading="saving" />
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
            <q-item
              v-for="file in availableFiles"
              :key="file.id"
              clickable
              v-ripple
              @click="attachFile(file.id)"
            >
              <q-item-section avatar>
                <q-icon name="insert_drive_file" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ file.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="add" color="primary" />
              </q-item-section>
            </q-item>
            <q-item v-if="availableFiles.length === 0">
              <q-item-section class="text-grey text-center">Нет доступных файлов</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
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

interface FileEntity { id: number; name: string; }
interface PassportScan { id: number; file?: FileEntity; }
interface Employee {
  id: number; lastName: string; firstName: string; middleName: string;
  birthDate: string; passportSeries: string; passportNumber: string;
  passportDate: string; passportCode: string; passportPlace: string;
  registrationRegion: string; registrationLocality: string; registrationStreet: string;
  registrationHouse: string; registrationHousing: string; registrationApartment: string;
  passportScans: PassportScan[];
}

const $q = useQuasar();
const rows = ref<Employee[]>([]);
const loading = ref(false);
const saving = ref(false);

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
  passportScans: [] as PassportScan[]
});

const form = reactive(initialFormState());

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
    await api.post('/passport-scans', {
      employeeId: dialog.activeId,
      fileId: fileId
    });
    const { data } = await api.get<Employee>(`/employees/${dialog.activeId}`);
    form.passportScans = data.passportScans;
    fileSelector.show = false; // Закрываем окно
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
  // Валидация обязательных полей (включая регион и город)
  if (!form.lastName || !form.firstName || !form.passportSeries || !form.registrationRegion || !form.registrationLocality) {
    $q.notify({ color: 'warning', message: 'Заполните обязательные поля (ФИО, Паспорт, Регион, Город)' });
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
