// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDataAnchor {
    function getAnchor(address _owner, uint256 _idx) external view returns (uint256, string memory, bytes memory, string memory, uint256);
    function anchorHasExisted(address _owner, bytes memory _hash) external view returns (bool);
}