import axios from 'axios';
import { Badge, Button, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

let fetching = false;
let searched = false;
let tm = null;

const SearchSelect = ({ options = [], url = null, value, multiple, labelValue = 'id', labelText = 'text', placeholder = 'Pilih data', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataOptions, setDataOptions] = useState(options);
  const wrapperRef = useRef(null);
  const searchInput = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        resetState();
      }
    };

    const handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        resetState();
      }
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    fetching = false;
    searched = false;
    tm = false;

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (multiple) {
      setSelectedOptions(value);
    } else {
      if (value) {
        setSelectedOptions([value]);
      } else {
        setSelectedOptions([]);
      }
    }
    if (isOpen) {
      fetching = false;
      searched = false;
      tm = false;
      searchInput?.current?.focus();
    }
  }, [isOpen, value])

  useEffect(() => {
    setDataOptions(options);
  }, [isOpen, JSON.stringify(options)]);

  const toggleOptions = () => {
    if (isOpen) {
      setSearchQuery('');
      setDataOptions([]);
    }
    setIsOpen(!isOpen);
  };

  const resetState = () => {
    setSearchQuery('');
    setDataOptions([]);
    setIsOpen(false);
  }

  const selectOption = (option, event) => {
    if (multiple) {
      const isSelected = selectedOptions.find(
        (selectedOption) => selectedOption[labelValue] === option[labelValue]
      );

      if (isSelected) {
        const updatedOptions = selectedOptions.filter(
          (selectedOption) => selectedOption[labelValue] !== option[labelValue]
        );
        setSelectedOptions(updatedOptions);
        onChange(updatedOptions);
      } else {
        setSelectedOptions([...selectedOptions, option]);
        onChange([...selectedOptions, option]);
      }
    } else {
      setSelectedOptions([option]);
      onChange(option);
      resetState();
    }

    event?.stopPropagation();
  };

  const handleSearch = (event) => {
    if (url) {
      clearTimeout(tm);
      if (event.target.value !== '') {
        fetching = true;
        searched = false;
        tm = setTimeout(() => {
          const getData = async () => {
            try {
              const res = await axios.get(url + `?search=${event.target.value}`);
              fetching = false;
              setDataOptions(res.data);
            } catch (error) {
              fetching = false;
              setDataOptions([]);
            }
            searched = true;
          }
          getData();
        }, 300);
      } else {
        fetching = false;
        searched = false;
        setDataOptions([]);
      }
    } else {
      if (event.target.value !== '') {
        searched = true;
      } else {
        searched = false;
      }
    }
    setSearchQuery(event.target.value);
  };

  const filteredOptions = dataOptions.filter((option) =>
    option[labelText]?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  const selectAllOptions = () => {
    setSelectedOptions(filteredOptions);
    onChange(filteredOptions);
  };

  const deselectAllOptions = () => {
    setSelectedOptions([]);
    onChange([]);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="w-full p-2.5 text-left bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue"
        onClick={toggleOptions}
      >
        {selectedOptions.length > 0
          ? <div className="flex gap-1 flex-wrap">{multiple ? selectedOptions.map((option, i) => {
            return <Badge key={i}>
              <div className='flex items-center gap-1'>
                <span>{option[labelText]}</span><FaTimes className='cursor-pointer' onClick={(event) => selectOption(option, event)} />
              </div>
            </Badge>
          }) : <div className="text-sm">{selectedOptions[0][labelText]}</div>}</div>
          : <span className="text-sm flex flex-wrap">{placeholder}</span>}
      </button>
      {isOpen && (
        <div className={`absolute z-10 w-full my-1 bg-white border rounded-md shadow-lg text-sm top-full`}>
          <div className="options-list">
            {multiple &&
              <div className="flex justify-between px-4 pt-3 pb-2">
                <Button
                  type="button"
                  size={`xs`}
                  color={`info`}
                  onClick={selectAllOptions}
                  disabled={filteredOptions.length === 0}
                >
                  Pilih Semua
                </Button>
                <Button
                  type="button"
                  size={`xs`}
                  color={`dark`}
                  onClick={deselectAllOptions}
                  disabled={selectedOptions.length === 0}
                >
                  Hapus Semua Pilihan
                </Button>
              </div>
            }
            <div className="pb-2 pt-3 px-4">
              <TextInput ref={searchInput} value={searchQuery} onChange={handleSearch} />
            </div>
            <ul className='max-h-48 overflow-y-auto'>
              {!fetching ?
                filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <li
                      key={option[labelValue]}
                      className={`px-4 py-2 cursor-pointer ${selectedOptions.find(
                        (selectedOption) =>
                          selectedOption[labelValue] === option[labelValue]
                      )
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-100'
                        }`}
                      onClick={() => selectOption(option)}
                    >
                      {option[labelText]}
                    </li>
                  ))
                ) : (searched ? <li className="px-4 py-2 text-gray-500">Data tidak ditemukan</li> : <li className="px-4 py-2 text-gray-500">Ketik untuk mencari data</li>) : <li className="px-4 py-2 text-gray-500">Mencari Data</li>
              }
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
