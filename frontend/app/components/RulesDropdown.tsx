import React, { useState } from "react";

const RulesDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-gray-800 text-white px-4 py-2">
      <div className="relative inline-block">
        <div
          className="flex items-center font-bold cursor-pointer"
          onClick={toggleDropdown}
        >
          Rules
          <span className="ml-2">▼</span>
        </div>
        {isDropdownOpen && (
          <div className="absolute mt-2 bg-white text-gray-800 border border-gray-200 rounded shadow-lg w-72 p-4 z-10 overflow-x-scroll" style={{ right: '-0.5rem' }}>
            <ul className="list-disc pl-5 space-y-2">
              <li>Enter an alphabet in any of the cells when it&apos;s your turn.</li>
              <li>
                If your alphabet forms words in vertical, horizontal or diagonal
                directions, forward or backward, you get points equal to the
                length of the word.
              </li>
              <li>
                Words can&apos;t be repeated. You can enter letters to repeat words
                but you won&apos;t get points if the word(s) so formed was already
                scored.
              </li>
              <li>
                The formed word should be more than three alphabets in size to
                be eligible for scoring.
              </li>
              <li>
                The game ends when all the cells are filled and the player with
                more points wins.
              </li>
              <li>
                If you do not want to play anymore, you can resign and the
                opponent wins.
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RulesDropdown;
