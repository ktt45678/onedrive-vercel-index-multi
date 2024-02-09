import { Fragment } from 'react'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'

import useLocalStorage from '../utils/useLocalStorage'
import { useSWRConfig } from '../utils/fetchWithSWR'

export const users: Array<{ id: number; name: string; value: string }> = [
  {
    id: 1,
    name: 'Default',
    value: ''
  }
]

const SwitchLayout = () => {
  const [preferredUser, setPreferredUser] = useLocalStorage('preferredUser', users[0])

  const { data: fetchedConfig } = useSWRConfig()

  return (
    <div className="relative w-24 flex-shrink-0 text-sm text-gray-600 dark:text-gray-300 md:w-28">
      <Listbox value={preferredUser} onChange={setPreferredUser}>
        <Listbox.Button className="relative w-full cursor-pointer rounded pl-4">
          <span className="pointer-events-none flex items-center">
            <FontAwesomeIcon className="mr-2 h-3 w-3" icon={faUser} />
            <span>{preferredUser.name}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon className="h-3 w-3" icon="chevron-down" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Listbox.Options className="absolute right-0 z-20 mt-1 w-32 overflow-auto rounded border border-gray-900/10 bg-white py-1 shadow-lg focus:outline-none dark:border-gray-500/30 dark:bg-gray-800">
            {users.map(layout => (
              <Listbox.Option
                key={layout.id}
                className={`${layout.value === preferredUser.value &&
                  'bg-blue-50 text-blue-700 dark:bg-blue-600/10 dark:text-blue-400'
                  } relative flex cursor-pointer select-none items-center py-1.5 pl-3 text-gray-600 hover:opacity-80 dark:text-gray-300`}
                value={layout}
              >
                <FontAwesomeIcon className="mr-2 h-3 w-3" icon={faUser} />
                <span className={layout.value === preferredUser.value ? 'font-medium' : 'font-normal'}>
                  {
                    layout.name
                  }
                </span>
                {layout.value === preferredUser.value && (
                  <span className="absolute inset-y-0 right-3 flex items-center">
                    <FontAwesomeIcon className="h-3 w-3" icon="check" />
                  </span>
                )}
              </Listbox.Option>
            ))}
            {fetchedConfig?.userList?.map((user: string, index: number) => (
              <Listbox.Option
                key={index + 2}
                className={`${user === preferredUser.value &&
                  'bg-blue-50 text-blue-700 dark:bg-blue-600/10 dark:text-blue-400'
                  } relative flex cursor-pointer select-none items-center py-1.5 pl-3 text-gray-600 hover:opacity-80 dark:text-gray-300`}
                value={{ id: index + 2, name: user, value: user }}
              >
                <FontAwesomeIcon className="mr-2 h-3 w-3" icon={faUser} />
                <span className={user === preferredUser.value ? 'font-medium' : 'font-normal'}>
                  {
                    user
                  }
                </span>
                {user === preferredUser.value && (
                  <span className="absolute inset-y-0 right-3 flex items-center">
                    <FontAwesomeIcon className="h-3 w-3" icon="check" />
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  )
}

export default SwitchLayout
