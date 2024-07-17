//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageSvg;
    string private i_highImageSvg;
    string private constant base64EncodedSvgPrefex = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event CreatedNft(uint256 tokenId, int256 highValue);
    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT ", "DSN") {
        s_tokenCounter = 0;
        i_highImageSvg = svgToImageUri(highSvg);
        i_lowImageSvg = svgToImageUri(lowSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageUri(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefex, svgBase64Encoded));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // if (!_exists(tokenId)) {
        //     revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        // }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = i_lowImageSvg;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageSvg;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '","description":"An NFT changed based on Chainlink Feed",',
                                '"attrebutes": [{"trait_type":"coolness","value":"100"}]},"image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter += 1;
        _safeMint(msg.sender, s_tokenCounter);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function getLowSvg() public view returns (string memory) {
        return i_lowImageSvg;
    }

    function getHighSvg() public view returns (string memory) {
        return i_highImageSvg;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
