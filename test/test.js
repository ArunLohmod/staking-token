const { ethers } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("ethers");

const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking Token", async () => {
  let owner, addr1, addr2;
  let stakingToken;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const StakingToken = await ethers.getContractFactory("StakingToken");
    stakingToken = await StakingToken.deploy();
    await stakingToken.deployed();
  });

  describe("Deployment", async () => {
    it("should set the right owner", async () => {
      expect(await stakingToken.owner()).to.equal(owner.address);
    });

    it("should set the value of tokenPerETH", async () => {
      expect(await stakingToken.tokenPerETH()).to.equal(100000);
    });

    it("should set the name of token", async () => {
      expect(await stakingToken.name()).to.equal("StakingToken");
    });
    it("should set the symbol of token", async () => {
      expect(await stakingToken.symbol()).to.equal("STK");
    });
  });

  describe("Minting", async () => {
    it("should revert if user pay less than or equal zero ETH", async () => {
      await expect(
        stakingToken.connect(addr1).mint({ value: 0 })
      ).to.be.revertedWith("pay more eth!");
    });

    it("should mint 100000 tokens if user pays 1 ETH", async () => {
      expect(
        await stakingToken
          .connect(addr1)
          .mint({ value: ethers.utils.parseEther("1") })
      ).to.changeEtherBalance(owner.address, 1);

      expect(await stakingToken.balanceOf(addr1.address)).to.changeTokenBalance(
        stakingToken,
        addr1.address,
        100000
      );
    });
  });

  describe("Staking", async () => {
    it("should revert if user is staking zero or less tokens", async () => {
      await expect(stakingToken.connect(addr1).stake(0)).to.be.revertedWith(
        "invaid amount!"
      );
    });

    it("user can stake his/her tokens", async () => {
      await expect(
        stakingToken
          .connect(addr1)
          .stake(BigNumber.from("100000000000000000000000"))
      ).to.emit(stakingToken, "Staked");

      expect(await stakingToken.balanceOf(addr1.address)).to.changeTokenBalance(
        stakingToken,
        addr1.address,
        BigNumber.from("100000000000000000000000")
      );
    });
  });

  describe("Unstaking", async () => {
    it("should revert if user is unstaking zero or less tokens", async () => {
      await expect(stakingToken.connect(addr1).unstake(0)).to.be.revertedWith(
        "invaid amount!"
      );
    });

    it("should revert if user unstake more token then he has staked", async () => {
      await expect(
        stakingToken
          .connect(addr1)
          .unstake(BigNumber.from("200000000000000000000000"))
      ).to.be.revertedWith("don't have this much token staked!");
    });

    it("should transfer the token back to user", async () => {
      await expect(
        stakingToken
          .connect(addr1)
          .unstake(BigNumber.from("50000000000000000000000"))
      ).to.emit(stakingToken, "Unstaked");

      expect(await stakingToken.balanceOf(addr1.address)).to.changeTokenBalance(
        stakingToken,
        addr1.address,
        BigNumber.from("50000000000000000000000")
      );
    });

    it("should call redeem function if unstaking every tokens", async () => {
      await expect(
        stakingToken
          .connect(addr1)
          .unstake(BigNumber.from("50000000000000000000000"))
      ).to.emit(stakingToken, "Redeemed");
    });
  });

  describe("Redeeming", async () => {
    it("should revert if user is redeem if he has zero token staked", async () => {
      await expect(stakingToken.connect(addr2).redeem()).to.be.revertedWith(
        "Nothing to redeem"
      );
    });

    it("rewards should be same as the staked tokens after 7 days", async () => {
      await stakingToken
        .connect(addr2)
        .mint({ value: BigNumber.from("10000000000000000") });

      await stakingToken
        .connect(addr2)
        .stake(BigNumber.from("1000000000000000000000"));

      const currentBlockTime = await time.latest();
      const seven_days = currentBlockTime + 7 * 24 * 60 * 60;
      await time.increaseTo(seven_days);

      let [, , rewards] = await stakingToken.connect(addr2).getYourDetails();
      expect(rewards).to.equal(BigNumber.from("1000000000000000000000"));
      await stakingToken.connect(addr2).redeem();
      [, , rewards] = await stakingToken.connect(addr2).getYourDetails();
      expect(rewards).to.equal(0);
    });
  });
});
