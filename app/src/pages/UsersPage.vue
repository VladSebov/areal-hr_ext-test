<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Управление пользователями</div>

      <q-input
        v-model="filters.search"
        placeholder="Поиск (ФИО, логин)..."
        outlined
        dense
        clearable
        style="min-width: 300px"
        @update:model-value="loadData"
      >
        <template v-slot:append><q-icon name="search" /></template>
      </q-input>

      <q-select
        v-model="filters.roleId"
        :options="roleOptions"
        label="Роль"
        outlined dense clearable
        emit-value map-options
        style="min-width: 200px"
        @update:model-value="loadData"
      />

      <q-btn color="primary" icon="add" label="Добавить пользователя" @click="openDialog()" />
    </div>

    <q-table :rows="rows" :columns="columns" row-key="id" :loading="loading" flat bordered>
      <template v-slot:body-cell-role="props">
        <q-td :props="props">
          <q-chip dense color="blue-1" text-color="blue-9">
            {{ props.row.role?.role }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-employee="props">
        <q-td :props="props">
          {{ props.row.employee?.lastName }} {{ props.row.employee?.firstName }} {{ props.row.employee?.middleName }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn flat round dense color="primary" icon="edit" @click="openDialog(props.row)" />
          <q-btn
            flat
            round
            dense
            color="negative"
            icon="delete"
            @click="confirmDelete(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ isEdit ? 'Редактирование пользователя' : 'Добавление пользователя' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-select
            v-model="form.employeeId"
            :options="filteredEmployeeOptions"
            label="Привязать к сотруднику *"
            outlined
            dense
            emit-value
            map-options
            :disable="isEdit"
            @update:model-value="handleEmployeeChange"
          />

          <q-input v-model="form.login" label="Логин *" outlined dense :disable="isEdit" />

          <q-input
            v-model="form.password"
            label="Пароль"
            outlined
            dense
            type="password"
            :placeholder="isEdit ? 'Оставьте пустым, чтобы не менять' : 'Минимум 8 символов'"
            bottom-slots
            :rules="[(val) => !val || val.length >= 8 || 'Пароль должен быть не менее 8 символов']"
          >
            <template v-slot:append>
              <q-icon
                v-if="form.password.length > 0"
                :name="form.password.length >= 8 ? 'check_circle' : 'error'"
                :color="form.password.length >= 8 ? 'positive' : 'negative'"
              />
            </template>

            <template v-slot:hint v-if="isEdit && !form.password">
              При редактировании можно оставить поле пустым
            </template>
          </q-input>

          <q-select
            v-model="form.roleId"
            :options="roleOptions"
            label="Системная роль *"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn unelevated label="Сохранить" color="primary" @click="save" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { api } from 'boot/axios';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface Role {
  id: number;
  role: string;
}

interface User {
  id: number;
  login: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  role?: Role;
  employee?: Employee;
}

const $q = useQuasar();
const rows = ref<User[]>([]);
const loading = ref(false);
const saving = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const rawEmployees = ref<Employee[]>([]);
const roleOptions = ref<{ label: string; value: number }[]>([]);
const employeeOptions = ref<{ label: string; value: number }[]>([]);

const busyEmployeeIds = computed(() => {
  return rows.value
    .map((user) => user.employee?.id)
    .filter((id) => id !== undefined && id !== null);
});

const filteredEmployeeOptions = computed(() => {
  return employeeOptions.value.filter((opt) => {
    const isCurrentEmployee = isEdit.value && opt.value === form.employeeId;
    return !busyEmployeeIds.value.includes(opt.value) || isCurrentEmployee;
  });
});

const filters = reactive({
  search: '',
  roleId: null as number | null,
});

const dialog = reactive({ show: false });
const form = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  login: '',
  password: '',
  roleId: null as number | null,
  employeeId: null as number | null,
});

const columns: QTableColumn[] = [
  { name: 'id', label: '№', field: 'id', align: 'left', sortable: true },
  { name: 'login', label: 'Логин', field: 'login', align: 'left', sortable: true },
  { name: 'lastName', label: 'Фамилия', field: 'lastName', sortable: true, align: 'left' },
  { name: 'firstName', label: 'Имя', field: 'firstName', sortable: true, align: 'left' },
  { name: 'middleName', label: 'Отчество', field: 'middleName', sortable: true, align: 'left' },
  { name: 'role', label: 'Роль', field: 'role', sortable: true, align: 'left' },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' },
];

const handleEmployeeChange = (empId: number | null) => {
  if (!empId) {
    form.lastName = '';
    form.firstName = '';
    form.middleName = '';
    return;
  }

  const emp = rawEmployees.value.find((e) => e.id === empId);
  if (emp) {
    form.lastName = emp.lastName;
    form.firstName = emp.firstName;
    form.middleName = emp.middleName || '';
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const [users, roles, emps] = await Promise.all([
      api.get<User[]>('/users', {
        params: {
          search: filters.search || undefined,
          roleId: filters.roleId || undefined
        }
      }),
      api.get<Role[]>('/roles'),
      api.get<Employee[]>('/employees'),
    ]);

    rows.value = users.data;
    rawEmployees.value = emps.data;

    roleOptions.value = roles.data.map((r: Role) => ({ label: r.role, value: r.id }));
    employeeOptions.value = emps.data.map((e: Employee) => ({
      label: `${e.lastName} ${e.firstName}`,
      value: e.id,
    }));
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка загрузки данных' });
  } finally {
    loading.value = false;
  }
};

const openDialog = (user: User | null = null) => {
  isEdit.value = !!user;
  currentId.value = user ? user.id : null;

  Object.assign(form, {
    lastName: user?.lastName || '',
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    login: user?.login || '',
    password: '',
    roleId: user?.role?.id || null,
    employeeId: user?.employee?.id || null,
  });

  dialog.show = true;
};

const save = async () => {
  if (!form.employeeId || !form.login || (!isEdit.value && !form.password)) {
    $q.notify({ color: 'warning', message: 'Пожалуйста, заполните все обязательные поля' });
    return;
  }

  const isAlreadyTaken = rows.value.some(
    (u) => u.employee?.id === form.employeeId && (!isEdit.value || u.id !== currentId.value),
  );

  if (isAlreadyTaken) {
    $q.notify({ color: 'negative', message: 'У этого сотрудника уже есть учетная запись' });
    return;
  }

  saving.value = true;
  try {
    const { password, ...rest } = form;
    const payload = isEdit.value && !password ? rest : { ...form };

    if (isEdit.value) {
      await api.patch(`/users/${currentId.value}`, payload);
    } else {
      await api.post('/users', payload);
    }

    dialog.show = false;
    await loadData();
    $q.notify({
      color: 'positive',
      message: `Пользователь успешно ${isEdit.value ? 'обновлен' : 'создан'}`,
    });
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при сохранении пользователя' });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Подтверждение удаления',
    message: 'Удалить доступ этого пользователя? Данные сотрудника сохранятся.',
    cancel: 'Отмена',
    ok: 'Удалить',
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/users/${id}`);
        await loadData();
        $q.notify({ color: 'positive', message: 'Пользователь удален' });
      } catch {
        $q.notify({ color: 'negative', message: 'Не удалось удалить пользователя' });
      }
    })();
  });
};

onMounted(loadData);
</script>
