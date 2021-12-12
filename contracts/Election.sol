pragma solidity ^0.5.0;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        string avatar;
        uint256 voteCount;
    }
    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;
    uint256 public candidatesCount;
    uint256 public totalVotes;

    event votedEvent(uint256 indexed _candidateId);

    constructor() public {
        addCandidate("Chayma", "images/chayma.jpg");
        addCandidate("Wassim", "images/wassim.png");
        addCandidate("Oumayma", "images/oumayma.jpg");
        addCandidate("Amine", "images/amine.png");
    }

    function addCandidate(string memory _name, string memory _url) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            _url,
            0
        );
    }

    function vote(uint256 _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);
        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        // record that voter has voted
        voters[msg.sender] = true;
        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        emit votedEvent(_candidateId);
    }
}
