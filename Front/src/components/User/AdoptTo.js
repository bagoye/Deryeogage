import React, { useEffect, useState } from "react";
import axios from "axios";
import * as S from "../../styled/User/AdoptTo.style"
import MissionList from "./MissionList";
import 'bootstrap/dist/css/bootstrap.min.css';

function AdoptTo() {
  const [adopts, setAdopts] = useState([]);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  console.log("=================adopts: ", adopts);
  const nickname = localStorage.getItem('nickname')

  const handleMissionClick = (missionId, index) => {
    setShowMissionModal(true);
    setSelectedMissionId(missionId);
    setSelectedIndex(index); // 인덱스를 상태로 설정
    console.log(missionId);
  };

  const closeModal = () => {
    setShowMissionModal(false);
  };

  const handleConfirmAdoption = async (adoptId, index) => {
    console.log("+++++++++++++++++++++++++++++++++++++adoptId", adoptId);
    const token = localStorage.getItem("accessToken");
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
    try {
      await axios.put(
        `${REACT_APP_API_URL}/adopts/toconfirm`,
        { id: adoptId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedAdopts = [...adopts];
      updatedAdopts[index].isConfirmed = true; // 해당 입양 항목을 확정 상태로 설정
      setAdopts(updatedAdopts);
    } catch (error) {
      console.error("Failed to confirm adoption:", error);
    }
  };

  const handleResponsibilityFeeReturn = async (boardId) => {
    const token = localStorage.getItem("accessToken");
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
    try {
      await axios.put(
        `${REACT_APP_API_URL}/postcosts/missioncomplete`,
        { boardId: boardId }, // 요청 본문에 필요한 데이터를 넣으세요.
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(adopts);
      fetchAdopts(); // 입양 목록을 다시 불러오기
    } catch (error) {
      console.error("Failed to return responsibility fee:", error);
    }
  };

  const fetchAdopts = async () => {
    const token = localStorage.getItem("accessToken");
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.get(`${REACT_APP_API_URL}/adopts/to`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("adopt/to 값 +++++++++++++++++++++++ ", response);

      const boardResponse = await axios.get(
        `${REACT_APP_API_URL}/boards/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("====================adoptTo:", response.data.data);

    const adoptsWithBoardInfo = await Promise.all(
      response.data.data.map(async (adopt) => {
        const matchingBoard = boardResponse.data.data.find(
          (board) => board.id === adopt.boardId
        );

        let completedMissions = 0;
        if (adopt.missionId !== null) {
          // missionId가 null이 아닌 경우에만 요청
          // 미션 정보를 가져옴
          const missionResponse = await axios.get(
            `${REACT_APP_API_URL}/missions/${adopt.missionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // 완료된 미션 수를 계산
          completedMissions = [
            missionResponse.data.data.missionUrl1,
            missionResponse.data.data.missionUrl2,
            missionResponse.data.data.missionUrl3,
            missionResponse.data.data.missionUrl4,
          ].filter((url) => url !== null).length; // null이 아닌 갯수를 세서 완료된 미션의 수를 계산
        }

        return {
          ...adopt,
          boardInfo: matchingBoard,
          imageUrl: matchingBoard?.fileList[0],
          completedMissions, // 완료된 미션 수
          toConfirmYn: adopt.toConfirmYn, // 입양 확정 여부를 추가
        };
      })
    );

      setAdopts(adoptsWithBoardInfo);
    } catch (error) {
      console.error("An error occurred while fetching the data:", error);
    }
  };

  useEffect(() => {
    fetchAdopts();
  }, []);

  const Media = ({ src }) => {
    if (src.endsWith(".mp4")) {
      return (
        <div className="col-1">
          <S.StyledVideo src={src} controls muted />
        </div>
      );
    }
    return (
      <div className="col-1">
        <S.StyledImage src={src} alt="board" />
      </div>
    );
  };

  return (
    <div className="container">
      <S.BoardRow className="row list">
        <div className="col-2 text-center">대표 이미지</div>
        <div className="col-4 text-center">입양글 제목</div>
        <div className="col-3 text-center">입양 확정 내역</div>
        {/* <div className="col-2 text-center">입양자</div> */}
        <div className="col-3 text-center">입양 미션</div>
      </S.BoardRow>
      <S.ScrollBar>
      {adopts.length === 0 ? (
        <div className="text-center">입양 내역이 없습니다.</div>
      ) : (
        adopts.map((adopt, index) => (
          <S.BoardRow className="row item" key={index}>
            <Media className="col-2" src={adopt.imageUrl} />
            <S.TitleLink className="col-4 text-center" to={`/adopt/${adopt.boardId}`}>{adopt.boardInfo?.title}</S.TitleLink>
            {adopt.toConfirmYn ? ( // toConfirmYn 값에 따라 버튼을 표시
              <S.ConfirmedButton className="col-3 text-center">입양 확정 완료</S.ConfirmedButton>
            ) : (
              <S.ConfirmButton className="col-3 text-center"
                onClick={() => handleConfirmAdoption(adopt.id, index)}
              >
                입양 확정하기
              </S.ConfirmButton>
            )}
            {/* <div className="col-2 text-center">{adopts[0].boardInfo.userNickname}</div>
            <div className="col-2 text-center">{nickname}</div> */}
            {adopt.status === "arrive" ?
              (adopt.completedMissions === 4 ? (
                <S.ResponsibilityButton className="col-3 text-center"
                  onClick={() => handleResponsibilityFeeReturn(adopt.boardId)}
                >
                  책임비 반환하기
                </S.ResponsibilityButton>
              ) : (
                <S.MissionButton className="col-3 text-center"
                  onClick={() => handleMissionClick(adopt.missionId, index)}
                >
                  입양 미션하기 ({adopt.completedMissions}/4)
                </S.MissionButton>
              )) : <div className="col-3 text-center">입양 예정</div>}
          </S.BoardRow>
        ))
      )}
      </S.ScrollBar>
      {showMissionModal && (
        <S.MissionModal>
          <S.MissionContent>
            <MissionList
              missionId={selectedMissionId}
              completedMissions={adopts[selectedIndex]?.completedMissions}
              fetchAdopts={fetchAdopts} // 이 줄을 추가하세요
            />
            <S.CloseButton onClick={closeModal}>닫기</S.CloseButton>
          </S.MissionContent>
        </S.MissionModal>
      )}
    </div>
  );
}

export default AdoptTo;
