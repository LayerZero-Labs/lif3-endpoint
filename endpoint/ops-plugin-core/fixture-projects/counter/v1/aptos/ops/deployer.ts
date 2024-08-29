import { Network } from '@layerzerolabs/lz-definitions'
import '../../../../../src/builtins'
import { CompileOption, DeployOption, Deployable, Deployment } from '@layerzerolabs/ops-core'

export class Deployer implements Deployable {
    async compile(option: CompileOption): Promise<void> {
        return Promise.resolve()
    }

    deploy(option: DeployOption): Promise<Deployment[]> {
        console.log('Deployer.deploy', option)
        return Promise.resolve([])
    }

    getDeployments(networks: Network[]): Promise<Deployment[]> {
        return Promise.resolve([])
    }
}
