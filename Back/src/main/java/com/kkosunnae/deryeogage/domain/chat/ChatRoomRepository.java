package com.kkosunnae.deryeogage.domain.chat;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, Integer> {
    List<ChatRoomEntity> findAllByUser1_IdAndBoardId(Long userId, Integer boardId);


    /** ChatRoom 조회 - 두 사용자와 게시판 ID로 정확한 매치 찾기 */
    ChatRoomEntity findByUser1_IdAndUser2_IdAndBoardId(Long userId1, Long userId2, Integer boardId);


    /** ChatRoom 목록조회 - 사용자 ID가 user1 또는 user2에 속한 채팅방 */
    List<ChatRoomEntity> findAllByUser1_IdOrUser2_Id(Long userId1, Long userId2);

    /** ChatRoom 조회 - RoomName 검색, 정확히 일치 */
    ChatRoomEntity findByRoomName(String roomName);

    /** ChatRoom 목록조회 - 기본정렬순, RoomName 검색, 정확히 일치 */
    List<ChatRoomEntity> findAllByRoomName(String roomName);

    /** ChatRoom 목록조회 - 조건정렬순, RoomName 검색, 정확히 일치 */
    List<ChatRoomEntity> findAllByRoomName(String roomName, Sort sort);

    /** ChatRoom 목록조회 - 기본정렬순, RoomName 검색, 포함 일치 */
    List<ChatRoomEntity> findAllByRoomNameContaining(String roomName);

    /** ChatRoom 목록조회 - 조건정렬순, RoomName 검색, 포함 일치 */
    List<ChatRoomEntity> findAllByRoomNameContaining(String roomName, Sort sort);

    /** ChatRoom id 일치 */
    Optional<ChatRoomEntity> findById(Integer id);

}
