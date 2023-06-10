// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingToken is ERC20 {
    struct Staker {
        uint totalStake;
        uint lastUpdateTime;
        uint rewards;
    }

    mapping(address => Staker) internal stakers;

    address public immutable owner;
    uint public constant tokenPerETH = 100000;

    event Staked(address byAccount, uint timeAt, uint amount);
    event Unstaked(address byAccount, uint timeAt, uint amount);
    event Redeemed(address byAccount, uint timeAt, uint amount);

    constructor() ERC20("StakingToken", "STK") {
        owner = msg.sender;
    }

    modifier update(address account) {
        Staker storage staker = stakers[account];

        staker.rewards = available(account);
        staker.lastUpdateTime = block.timestamp;
        _;
    }

    /**
     * @dev users can mint token by paying ETH, 100000 token per ETH, eth will be transfered to owner
     */

    function mint() public payable {
        require(msg.value > 0, "pay more eth!");

        (bool sucess, ) = owner.call{value: msg.value}("");
        require(sucess, "transaction failed!");

        uint tokenAmount = msg.value * tokenPerETH;
        _mint(msg.sender, tokenAmount);
    }

    /**
     * @dev stakes an amount of tokens
     * @param amount amount to stake
     */
    function stake(uint amount) public update(msg.sender) {
        require(amount > 0, "invaid amount!");
        Staker storage staker = stakers[msg.sender];

        _transfer(msg.sender, address(this), amount);
        staker.totalStake += amount;

        emit Staked(msg.sender, block.timestamp, amount);
    }

    /**
     * @dev unstake all tokens, it calls redeem function automatically
     */
    function unstake(uint amount) public update(msg.sender) {
        require(amount > 0, "invaid amount!");
        require(
            amount <= stakers[msg.sender].totalStake,
            "don't have this much token staked!"
        );

        Staker storage staker = stakers[msg.sender];

        uint stakedAmount = staker.totalStake;
        require(stakedAmount > 0, "nothing to unstake!");

        if (amount == stakedAmount) {
            redeem();
        }

        staker.totalStake -= amount;
        _transfer(address(this), msg.sender, amount);

        emit Unstaked(msg.sender, block.timestamp, stakedAmount);
    }

    /**
     * @dev redeems all of a user's reward tokens.
     */
    function redeem() public update(msg.sender) {
        Staker storage staker = stakers[msg.sender];

        uint amount = staker.rewards;
        require(amount > 0, "Nothing to redeem");

        staker.rewards = 0;
        _mint(msg.sender, amount);

        emit Redeemed(msg.sender, block.timestamp, amount);
    }

    /**
     * @dev returns the details of the caller.
     */

    function getYourDetails()
        public
        view
        returns (uint totalStake, uint lastUpdateTime, uint totalRewards)
    {
        Staker memory staker = stakers[msg.sender];

        totalStake = staker.totalStake;
        lastUpdateTime = staker.lastUpdateTime;
        totalRewards = available(msg.sender); //using available for geeting updated rewards
    }

    /**
     * @dev returns the number of reward tokens available for an address
     * @param account account
     */
    function available(address account) internal view returns (uint) {
        Staker memory staker = stakers[account];

        uint timeElapsed = block.timestamp - staker.lastUpdateTime;
        uint earned = (staker.totalStake * timeElapsed) / (86400 * 7); // same amount of reward as staked token after 7 days

        uint availableRewardAmount = staker.rewards + earned;
        return availableRewardAmount;
    }
}
