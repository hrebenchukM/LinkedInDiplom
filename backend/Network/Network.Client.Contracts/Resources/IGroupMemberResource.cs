using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupMember;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы с участниками групп Network-модуля.
// Внутренняя точка доступа фасада к участникам групп.
public interface IGroupMemberResource
{
    Task<GroupMemberResult> JoinAsync(JoinGroupParameters parameters);

    Task<GroupMemberResult> LeaveAsync(LeaveGroupParameters parameters);

    Task<IReadOnlyCollection<GroupMemberDto>> GetGroupMembersAsync(GetGroupMembersParameters parameters);
}
