package com.nearfix.auth.mapper;

import com.nearfix.auth.dto.RegisterRequest;
import com.nearfix.auth.dto.UserResponse;
import com.nearfix.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    User registerRequestToUser(RegisterRequest request);

    UserResponse userToUserResponse(User user);
}
