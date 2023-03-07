// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Agent {
    mapping (address => bool) public agents;

    event agent_changed(address agent, bool state);

    modifier onlyAgent() {
        if(!agents[msg.sender]) revert();
        _;
    }

    constructor() {
       _setAgent(msg.sender, true);
    }

    function _setAgent(address _agent, bool _state) internal {
        agents[_agent] = _state;
        emit agent_changed(_agent, _state);
    }
}
