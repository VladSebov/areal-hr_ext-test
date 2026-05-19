import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs/',
  title: "Документация Areal HR",
  description: "Веб-приложение для специалистов по кадрам (HR), позволяющее управлять информацией о сотрудниках в нескольких организациях.",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Руководство по приложению', link: '/guide/index' },
      { text: 'Справочник API', link: '/api/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Руководство пользователя',
          items: [
            { text: 'Структура данных Areal HR App', link: '/guide/#структура-данных-areal-hr-app' },
            { text: 'Кадровые операции', link: '/guide/#кадровые-операции' },
            { text: 'История изменений (Аудит)', link: '/guide/#история-изменений-аудит' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Для разработчиков',
          items: [
            { text: 'Общие сведения', link: '/api/' },
            { text: 'Сотрудники (Employees)', link: '/api/employees' },
            { text: 'Департаменты (Departments)', link: '/api/departments' },
            { text: 'Файлы (Files)', link: '/api/files' },
            { text: 'Организации (Organizations)', link: '/api/organizations' },
            { text: 'Кадровые операции (HR Operations)', link: '/api/hr-operations' },
            { text: 'История операций (Operations History)', link: '/api/operations-history' },
            { text: 'Скан-копии паспортов (Passport Scans)', link: '/api/passport-scans' },
            { text: 'Должности (Positions)', link: '/api/positions' },
            { text: 'Пользователи (Users)', link: '/api/users' }
          ]
        }
      ]
    },

    outline: {
      label: 'На этой странице'
    },

    docFooter: {
      prev: 'Предыдущая страница',
      next: 'Следующая страница'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Поиск',
            buttonAriaLabel: 'Поиск по документации'
          },
          modal: {
            noResultsText: 'Ничего не найдено',
            resetButtonTitle: 'Очистить поиск',
            footer: {
              selectText: 'выбрать',
              navigateText: 'перейти',
              closeText: 'закрыть'
            }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/VladSebov/areal-hr_ext-test' }
    ]
  }
})